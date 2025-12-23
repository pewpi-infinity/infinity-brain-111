#!/usr/bin/env node
/**
 * Infinity Research Orchestrator (big fix edition)
 * - Auto-discovers carts (.js/.py)
 * - Skips failed carts without halting
 * - Quarantines failing carts and drops stub replacements
 * - Loud provenance logs and stitched research artifact with token header
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const crypto = require('crypto');

function nowISO() { return new Date().toISOString(); }
function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }
function readJSON(p, fallback = {}) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return fallback; } }
function sha256File(filePath) { try { return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex'); } catch { return null; } }

function listCarts(cartsDir) {
  if (!fs.existsSync(cartsDir)) return [];
  return fs.readdirSync(cartsDir)
    .map(n => path.join(cartsDir, n))
    .filter(f => fs.statSync(f).isFile())
    .filter(f => ['.js', '.py'].includes(path.extname(f)))
    .sort();
}

function readAllTextIn(dir) {
  if (!fs.existsSync(dir)) return '';
  const files = fs.readdirSync(dir)
    .map(f => path.join(dir, f))
    .filter(f => fs.statSync(f).isFile());
  return files.map(f => `# ${path.basename(f)}\n\n${fs.readFileSync(f, 'utf8')}\n`).join('\n');
}

function runCart(cmd, args, options) {
  return new Promise((resolve) => {
    const start = Date.now();
    const child = spawn(cmd, args, options);
    let stdout = '', stderr = '';
    child.stdout.on('data', (d) => { const s = d.toString(); stdout += s; process.stdout.write(s); });
    child.stderr.on('data', (d) => { const s = d.toString(); stderr += s; process.stderr.write(s); });
    child.on('close', (code) => resolve({ code, stdout, stderr, ms: Date.now() - start }));
  });
}

function writeProvenance(provDir, record) {
  const safeName = record.cartRelative.replace(/[\\/]/g, '__');
  const outPath = path.join(provDir, `${safeName}.${Date.now()}.json`);
  fs.writeFileSync(outPath, JSON.stringify(record, null, 2), 'utf8');
  return outPath;
}

function colorBadge(color) {
  const map = { RED: '#ff3b30', BLUE: '#007aff', GREEN: '#34c759', YELLOW: '#ffcc00', PURPLE: '#af52de', ORANGE: '#ff9500', CYAN: '#5ac8fa', PINK: '#ff2d55' };
  const hex = map[(color || '').toUpperCase()] || '#666';
  return `![Token Color](${encodeURI(`data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='18' height='18'><rect width='18' height='18' fill='${hex}'/></svg>`)})`;
}

function makeStubFor(filePath) {
  const ext = path.extname(filePath);
  const stubText = ext === '.py'
    ? `print("Stub cart: ${path.basename(filePath)} was quarantined. Placeholder output.")\n`
    : `console.log("Stub cart: ${path.basename(filePath)} was quarantined. Placeholder output.");\n`;
  fs.writeFileSync(filePath, stubText, 'utf8');
}

async function main() {
  const argIdx = process.argv.indexOf('--config');
  const configPath = argIdx !== -1 ? process.argv[argIdx + 1] : path.join(process.cwd(), 'config', 'default.json');
  const cfg = readJSON(configPath, {});
  const dirs = cfg.dirs || {};
  const token = cfg.token || {};
  const execCfg = cfg.execution || {};

  const repoRoot = cfg.repoRoot || process.cwd();
  const cartsDir = dirs.carts || path.join(repoRoot, 'carts');
  const termsDir = dirs.terms || path.join(repoRoot, 'terms');
  const sitesDir = dirs.sites || path.join(repoRoot, 'websites');
  const logsDir = dirs.logs || path.join(repoRoot, 'logs');
  const provDir = dirs.provenance || path.join(repoRoot, '.provenance');
  const artifactsDir = dirs.artifacts || path.join(repoRoot, 'artifacts');
  const quarantineDir = dirs.quarantine || path.join(repoRoot, 'carts_quarantine');

  [logsDir, provDir, artifactsDir, quarantineDir].forEach(ensureDir);

  console.log(`[INIT] Config: ${configPath}`);
  console.log(`[INIT] Carts: ${cartsDir}`);
  console.log(`[INIT] Logs: ${logsDir}`);
  console.log(`[INIT] Provenance: ${provDir}`);
  console.log(`[INIT] Artifacts: ${artifactsDir}`);
  console.log(`[INIT] Quarantine: ${quarantineDir}`);

  const carts = listCarts(cartsDir).map(f => ({
    path: f,
    rel: path.relative(repoRoot, f),
    ext: path.extname(f).slice(1),
    hash: sha256File(f)
  }));

  if (carts.length === 0) {
    console.error('[ERROR] No carts found. Add .js or .py carts under carts/.');
    process.exit(2);
  }

  console.log(`[DISCOVER] Found ${carts.length} carts`);
  carts.forEach(c => console.log(` - ${c.rel} [${c.ext}] hash=${c.hash?.slice(0,12) || 'none'}`));

  const runLogs = [];
  for (const cart of carts) {
    const base = cart.rel.replace(/[\\/]/g, '__').replace(/\.[^.]+$/, '');
    const outLog = path.join(logsDir, `${base}.out.log`);
    const errLog = path.join(logsDir, `${base}.err.log`);

    console.log(`\n[RUN] ${cart.rel} @ ${nowISO()}`);

    let cmd, args;
    if (cart.ext === 'js') { cmd = 'node'; args = [cart.path]; }
    else if (cart.ext === 'py') { cmd = 'python3'; args = [cart.path]; }
    else {
      console.log(`[SKIP] Unsupported extension: ${cart.ext}`);
      runLogs.push({ cart: cart.rel, exit: -1, skipped: true, reason: 'unsupported', ms: 0, hash: cart.hash });
      continue;
    }

    const env = { ...process.env, ...(execCfg.env || {}), RESEARCH_MODE: 'mongoose', CART_PATH: cart.path };
    const result = await runCart(cmd, args, { env, cwd: repoRoot });

    fs.writeFileSync(outLog, result.stdout || '', 'utf8');
    fs.writeFileSync(errLog, result.stderr || '', 'utf8');

    const prov = {
      cartPath: cart.path,
      cartRelative: cart.rel,
      cartHash: cart.hash,
      extension: cart.ext,
      command: [cmd, ...args],
      startISO: nowISO(),
      durationMs: result.ms,
      exitCode: result.code,
      logs: { stdoutFile: outLog, stderrFile: errLog },
      repoRoot,
      runnerVersion: '1.1.0-big',
      token: token
    };
    const provFile = writeProvenance(provDir, prov);

    if (result.code !== 0) {
      console.error(`[SKIP] ${cart.rel} failed exit=${result.code} ms=${result.ms} -> ${path.basename(provFile)}`);

      // Auto-quarantine and stub replacement
      if (execCfg.autoQuarantine) {
        const quarantineTarget = path.join(quarantineDir, path.basename(cart.path));
        try {
          fs.renameSync(cart.path, quarantineTarget);
          console.log(`[QUARANTINE] Moved ${cart.rel} -> ${path.relative(repoRoot, quarantineTarget)}`);
          if (execCfg.autoStubOnQuarantine) {
            makeStubFor(cart.path);
            console.log(`[STUB] Dropped stub at ${cart.rel}`);
          }
        } catch (e) {
          console.error(`[QUARANTINE-ERROR] ${e.message}`);
        }
      }

      runLogs.push({
        cart: cart.rel,
        exit: result.code,
        skipped: true,
        ms: result.ms,
        hash: cart.hash,
        stdoutFile: outLog,
        stderrFile: errLog
      });

      // continue regardless of failFast (we're in big-fix mode)
      continue;
    }

    console.log(`[DONE] ${cart.rel} exit=${result.code} ms=${result.ms} prov=${path.basename(provFile)}`);
    runLogs.push({
      cart: cart.rel,
      exit: result.code,
      skipped: false,
      ms: result.ms,
      hash: cart.hash,
      stdoutFile: outLog,
      stderrFile: errLog
    });
  }

  // Assemble research artifact
  const tokenHeader = [
    `Token Number: ${token.number ?? ''}`,
    `Token Value: ${token.value ?? ''}`,
    `Token Color: ${token.color ?? ''} ${colorBadge(token.color)}`,
    `Token DateTime: ${token.datetime ?? nowISO()}`
  ].join('\n');

  const termsText = readAllTextIn(termsDir);
  const sitesText = readAllTextIn(sitesDir);

  const sections = [];
  sections.push(`# Research Artifact (mongoose.os)\n`);
  sections.push(`## Token\n\n${tokenHeader}\n`);
  if (termsText.trim()) sections.push(`## Terms\n\n${termsText}\n`);
  if (sitesText.trim()) sections.push(`## Websites\n\n${sitesText}\n`);

  sections.push(`## Cart outputs\n`);
  for (const rl of runLogs) {
    const std = fs.existsSync(rl.stdoutFile) ? fs.readFileSync(rl.stdoutFile, 'utf8') : '';
    const status = rl.skipped ? 'SKIPPED' : 'OK';
    sections.push(`### ${rl.cart} (${status})\n`);
    sections.push('```text\n' + (std.trim() || '(no stdout)') + '\n```\n');
  }

  sections.push(`## Run summary\n`);
  sections.push('```json\n' + JSON.stringify(runLogs, null, 2) + '\n```\n');

  const artifactPath = path.join(artifactsDir, 'research.md');
  fs.writeFileSync(artifactPath, sections.join('\n'), 'utf8');

  console.log(`[ARTIFACT] Wrote ${artifactPath}`);
  console.log('[COMPLETE] Research pipeline finished.');
}

main().catch(err => {
  console.error('[FATAL] Runner crashed:', err);
  process.exit(1);
});
