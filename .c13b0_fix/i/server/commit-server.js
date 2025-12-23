/**
 * server/commit-server.js
 *
 * Minimal express server to append frontend-typed text to logs/txt.log using the GitHub Contents API.
 * - Requires environment variables set in server/.env:
 *     GITHUB_TOKEN (fine-grained PAT with Contents: Read & write for pewpi-infinity/i)
 *     COMMIT_SECRET (a random secret to authenticate frontend -> server requests)
 *     PORT (optional, default 4000)
 *
 * Security:
 * - Do NOT commit server/.env to the repository.
 * - Protect the server in production (auth, IP allowlist, rate limiting).
 *
 * Usage:
 *   cd server
 *   npm install
 *   cp .env.example .env    # edit .env locally to add real values
 *   npm start
 */
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { Octokit } = require('@octokit/rest');

const app = express();
app.use(bodyParser.json());

const OWNER = 'pewpi-infinity';
const REPO = 'i';
const PATH = 'logs/txt.log';
const COMMITTER = { name: 'pewpi-infinity bot', email: 'bot@pewpi-infinity.local' };

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const COMMIT_SECRET = process.env.COMMIT_SECRET;

if (!GITHUB_TOKEN) {
  console.error('Missing GITHUB_TOKEN in environment. Create server/.env from .env.example and set a token.');
  process.exit(1);
}
if (!COMMIT_SECRET) {
  console.error('Missing COMMIT_SECRET in environment. Create server/.env from .env.example and set a secret.');
  process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function getFileContentAndSha() {
  try {
    const r = await octokit.repos.getContent({
      owner: OWNER,
      repo: REPO,
      path: PATH
    });
    if (r && r.data && r.data.type === 'file' && r.data.content) {
      return { content: Buffer.from(r.data.content, 'base64').toString('utf8'), sha: r.data.sha };
    }
    return { content: '', sha: null };
  } catch (err) {
    if (err.status === 404) {
      return { content: '', sha: null };
    }
    throw err;
  }
}

app.post('/commit', async (req, res) => {
  try {
    // Validate secret (header or JSON field)
    const headerSecret = req.get('X-Commit-Secret');
    const bodySecret = req.body && req.body.secret;
    if (!headerSecret && !bodySecret) {
      return res.status(401).json({ error: 'Missing secret' });
    }
    if ((headerSecret || bodySecret) !== COMMIT_SECRET) {
      return res.status(403).json({ error: 'Invalid secret' });
    }

    const text = (req.body && typeof req.body.text === 'string') ? req.body.text : '';
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'text required' });
    }

    // Read existing content and sha (handles 404)
    const existing = await getFileContentAndSha();

    // Append with timestamp
    const timestamp = new Date().toISOString();
    const entry = `${timestamp} | ${text.replace(/\r/g, '')}\n`;
    const newContent = (existing.content ? existing.content + entry : entry);
    const encoded = Buffer.from(newContent, 'utf8').toString('base64');

    // Prepare params for createOrUpdateFileContents
    const params = {
      owner: OWNER,
      repo: REPO,
      path: PATH,
      message: `Frontend log update: append entry`,
      content: encoded,
      committer: COMMITTER
    };
    if (existing.sha) params.sha = existing.sha;

    const result = await octokit.repos.createOrUpdateFileContents(params);
    return res.json({ ok: true, commit: result.data.commit.sha });
  } catch (err) {
    console.error('Commit server error', err && err.status, err && err.message);
    const status = (err && err.status) || 500;
    return res.status(status).json({ error: err && err.message ? err.message : 'unknown error' });
  }
});

// Health endpoint
app.get('/healthz', (req, res) => res.json({ ok: true }));

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`commit server listening on ${port}`);
});