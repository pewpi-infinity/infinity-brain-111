/**
 * static/js/embedded-writer.js
 *
 * Helpers that ensure the single-file embedded store actually keeps a complete
 * conversation log inside the repo_data.block (log_txt) and optionally pushes
 * short lines to a server (CommitClient or /log). Drops-safe: if save function
 * exists in the page it uses that; otherwise it directly edits the repo_data script.
 *
 * Intended usage:
 * - Add this file to the repo at static/js/embedded-writer.js
 * - Include <script src="/static/js/embedded-writer.js"></script> in index.html (near the end)
 *
 * Behavior:
 * - Every 3s the script scans repo_data.entries and rebuilds repo_data.log_txt
 *   so the embedded log_txt always contains a full appended conversation history
 *   (deduplicated).
 * - When new lines are added it can optionally push them to:
 *   - CommitClient.send(...) if CommitClient is present (push short summary)
 *   - POST /log endpoint if reachable (JSON { text, kind })
 *
 * Safety:
 * - Does NOT read or send passphrases.
 * - Does not modify encoded ciphers.
 * - All writes to the repo_data block happen in the browser only; persisting to the GitHub repo still requires you to paste the exported HTML or use your workflow.
 */

(function () {
  const REBUILD_INTERVAL_MS = 3000;
  const LOG_LINE_KIND_MAP = { user: 'IN', ai: 'OUT', encoded: 'ENC', log: 'INFO', system: 'INFO' };

  function loadRepoData() {
    const el = document.getElementById('repo_data');
    if (!el) return { meta: {}, wallets: {}, entries: [], log_txt: '', embedded_files: {} };
    try { return JSON.parse(el.textContent || el.innerText); } catch (e) { return { meta: {}, wallets: {}, entries: [], log_txt: '', embedded_files: {} }; }
  }

  function saveRepoData(obj) {
    // Prefer existing page API if available
    if (typeof window.saveRepo === 'function') {
      try { window.saveRepo(obj); return; } catch (e) { /* fallthrough */ }
    }
    if (typeof window.saveRepoData === 'function') {
      try { window.saveRepoData(obj); return; } catch (e) { /* fallthrough */ }
    }
    // fallback: write directly into script tag
    const el = document.getElementById('repo_data');
    if (el) el.textContent = JSON.stringify(obj, null, 2);
    // signal update by dispatching a custom event
    try { document.dispatchEvent(new CustomEvent('repoDataUpdated', { detail: obj })); } catch (e) {}
  }

  function summaryForEntry(e) {
    if (!e) return '';
    if (e.type === 'encoded') return e.summary || `(encoded ${e.id})`;
    if (e.type === 'ai') return e.summary || e.text || '';
    if (e.type === 'user' || e.type === 'log' || e.type === 'system') return e.text || e.summary || '';
    return e.text || '';
  }

  function buildLogLinesFromEntries(entries) {
    const lines = [];
    for (const e of entries) {
      const kind = LOG_LINE_KIND_MAP[e.type] || 'INFO';
      const body = summaryForEntry(e);
      // keep the encoded cipher out of the log body — only include id/summary
      lines.push(`[${e.timestamp || ''}] [${kind}] ${body || ('(' + (e.id || 'no-id') + ')')}`);
    }
    return lines;
  }

  // Deduplicate lines while preserving order
  function dedupeKeepOrder(arr) {
    const seen = new Set();
    const out = [];
    for (const s of arr) {
      if (!seen.has(s)) { seen.add(s); out.push(s); }
    }
    return out;
  }

  // Rebuild repo_data.log_txt from entries and write back if changed
  function rebuildLogTxt() {
    const repo = loadRepoData();
    const entries = repo.entries || [];
    const lines = buildLogLinesFromEntries(entries);
    const deduped = dedupeKeepOrder(lines).join('\n') + (lines.length ? '\n' : '');
    if ((repo.log_txt || '') !== deduped) {
      repo.log_txt = deduped;
      saveRepoData(repo);
      // broadcast change event for other page code to react
      try { document.dispatchEvent(new CustomEvent('embeddedLogUpdated', { detail: { log_txt: deduped } })); } catch (e) {}
      return deduped;
    }
    return null;
  }

  // Push newly added log lines to server endpoints (optional)
  // This keeps the possibility to mirror embedded log to /log or CommitClient
  let lastPushedHash = '';
  async function pushNewLogLinesIfAny() {
    try {
      const repo = loadRepoData();
      const current = repo.log_txt || '';
      const hash = btoa(unescape(encodeURIComponent(current))).slice(0, 16);
      if (hash === lastPushedHash) return;
      lastPushedHash = hash;
      // split into lines and push only the new ones (for simplicity push all)
      const lines = current.split('\n').filter(Boolean);
      if (lines.length === 0) return;

      // Try CommitClient first (short summary) if available
      if (window.CommitClient && typeof window.CommitClient.send === 'function') {
        try {
          // Send a single joined payload to avoid spamming (server can split or append)
          const payload = lines.slice(-20).join('\n'); // last 20 lines
          await window.CommitClient.send(`[embedded-log] ${payload}`);
        } catch (e) {
          // ignore commit errors, fallback to /log
        }
      }

      // Then try /log endpoint (log_server.py)
      try {
        await fetch('/log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: lines.slice(-20).join('\n'), kind: 'IN' }) });
      } catch (e) {
        // ignore network errors (page must work offline too)
      }
    } catch (e) {
      // swallow errors to avoid breaking page
      console.error('embedded-writer push error', e);
    }
  }

  // Helper: when the page adds entries it likely calls saveRepoData/saveRepo,
  // but some flows may not. We set a MutationObserver on the repo_data script to react quickly.
  function watchRepoDataMutations() {
    const repoEl = document.getElementById('repo_data');
    if (!repoEl) return;
    const obs = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'characterData' || m.type === 'childList') {
          // repo_data changed — ensure log_txt contains full history
          try { rebuildLogTxt(); } catch (e) {}
        }
      }
    });
    obs.observe(repoEl, { characterData: true, childList: true, subtree: true });
    // Also respond to custom event saved by saveRepoData fallback
    document.addEventListener('repoDataUpdated', () => { try { rebuildLogTxt(); } catch(e) {} });
  }

  // Periodic reconciliation: in case code bypasses repo_data writes, rebuild log_txt periodically
  function startPeriodicRebuild() {
    // first rebuild now
    try { rebuildLogTxt(); } catch (e) {}
    // then interval
    setInterval(async () => {
      const changed = rebuildLogTxt();
      if (changed !== null) {
        // push if we rebuilt
        await pushNewLogLinesIfAny();
      }
    }, REBUILD_INTERVAL_MS);
  }

  // Expose API for other scripts or console
  window.EmbeddedWriter = {
    rebuildLogTxt,
    pushNewLogLinesIfAny,
    buildLogLinesFromEntries,
    loadRepoData,
    saveRepoData
  };

  // Wire up on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { watchRepoDataMutations(); startPeriodicRebuild(); });
  } else {
    watchRepoDataMutations(); startPeriodicRebuild();
  }
})();