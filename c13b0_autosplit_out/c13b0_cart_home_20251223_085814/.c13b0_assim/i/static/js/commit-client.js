/**
 * static/js/commit-client.js
 *
 * Small client helper to POST typed text to the server commit endpoint.
 * Usage:
 *   CommitClient.send("your text")
 *     .then(resp => console.log('committed', resp))
 *     .catch(err => console.error(err));
 *
 * IMPORTANT:
 * - Do NOT store GitHub tokens in client code.
 * - For simple setups you can set window.COMMIT_SECRET from server-rendered HTML to provide the secret.
 */

const CommitClient = (function () {
  const ENDPOINT = '/commit';
  const SECRET = window.COMMIT_SECRET || null;

  async function send(text) {
    if (!text || !text.trim()) throw new Error('text required');

    const payload = { text: text };
    const headers = { 'Content-Type': 'application/json' };
    if (SECRET) headers['X-Commit-Secret'] = SECRET;

    const resp = await fetch(ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      credentials: 'same-origin'
    });
    if (!resp.ok) {
      const body = await resp.json().catch(() => ({}));
      throw new Error(body && body.error ? body.error : `HTTP ${resp.status}`);
    }
    return resp.json();
  }

  return { send };
})();

window.CommitClient = CommitClient;