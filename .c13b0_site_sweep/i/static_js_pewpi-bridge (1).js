/**
 * static/js/pewpi-bridge.js
 *
 * Provides global wrappers so the page has encryptText / decryptText and
 * ensures the single-file bundle APIs (appendEntry, appendLogText, awardTokenToUser)
 * are available to other inline scripts. Fixes "encryptText is not defined".
 *
 * Install:
 * 1) Save this file to static/js/pewpi-bridge.js in your repo.
 * 2) Add this script tag near the end of your index.html body (after other scripts):
 *      <script src="/static/js/pewpi-bridge.js"></script>
 *
 * Security:
 * - This script never reads or sends passphrases anywhere.
 * - It only exposes wrappers that call existing in-page crypto or fallback to a local WebCrypto implementation.
 */

(function () {
  // If globals already exist, do nothing.
  if (window.encryptText && window.decryptText && window.EmbeddedWriter) {
    console.log('pewpi-bridge: bridge already present');
    return;
  }

  // --- Small helper: base64 <-> Uint8Array
  function b64ToUint8(b64) {
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return arr;
  }
  function uint8ToB64(u8) {
    let s = '';
    for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
    return btoa(s);
  }

  // --- Fallback WebCrypto implementation (same API shape used in other scripts)
  async function deriveKey(passphrase, salt, iterations = 200000) {
    const enc = new TextEncoder();
    const baseKey = await crypto.subtle.importKey('raw', enc.encode(passphrase), { name: 'PBKDF2' }, false, ['deriveKey']);
    const key = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    return key;
  }

  async function fallbackEncryptText(plaintext, passphrase, iterations = 200000) {
    const enc = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(passphrase, salt, iterations);
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plaintext));
    const ctArr = new Uint8Array(ciphertext);
    const combined = new Uint8Array(salt.length + iv.length + ctArr.length);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(ctArr, salt.length + iv.length);
    return uint8ToB64(combined);
  }

  async function fallbackDecryptText(b64, passphrase, iterations = 200000) {
    const combined = b64ToUint8(b64);
    if (combined.length < 16 + 12 + 16) throw new Error('Encoded data too short or invalid');
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const ct = combined.slice(28);
    const key = await deriveKey(passphrase, salt, iterations);
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
    return new TextDecoder().decode(plain);
  }

  // --- Expose global encryptText / decryptText --
  // If an in-page crypto module exists (PEWPI_CRYPTO or other), prefer it.
  window.encryptText = window.encryptText || (async function (plaintext, passphrase, iterations) {
    try {
      if (window.PEWPI_CRYPTO && typeof window.PEWPI_CRYPTO.encryptText === 'function') {
        return await window.PEWPI_CRYPTO.encryptText(plaintext, passphrase, iterations || 200000);
      }
      // older naming: encryptText may exist on global scope in some pages
      if (typeof window._encryptText === 'function') {
        return await window._encryptText(plaintext, passphrase, iterations || 200000);
      }
    } catch (e) {
      // fallthrough to fallback
      console.warn('pewpi-bridge: crypto wrapper error, falling back', e && e.message);
    }
    return await fallbackEncryptText(plaintext, passphrase, iterations || 200000);
  });

  window.decryptText = window.decryptText || (async function (b64, passphrase, iterations) {
    try {
      if (window.PEWPI_CRYPTO && typeof window.PEWPI_CRYPTO.decryptText === 'function') {
        return await window.PEWPI_CRYPTO.decryptText(b64, passphrase, iterations || 200000);
      }
      if (typeof window._decryptText === 'function') {
        return await window._decryptText(b64, passphrase, iterations || 200000);
      }
    } catch (e) {
      console.warn('pewpi-bridge: crypto wrapper error, falling back', e && e.message);
    }
    return await fallbackDecryptText(b64, passphrase, iterations || 200000);
  });

  // --- Repo-data helpers ---
  function readRepoData() {
    const el = document.getElementById('repo_data');
    if (!el) return { meta: {}, wallets: {}, entries: [], log_txt: '', embedded_files: {} };
    try { return JSON.parse(el.textContent || el.innerText); } catch (e) { return { meta: {}, wallets: {}, entries: [], log_txt: '', embedded_files: {} }; }
  }
  function writeRepoData(obj) {
    // Prefer existing API
    if (typeof window.saveRepoData === 'function') {
      try { window.saveRepoData(obj); return; } catch(e) {}
    }
    if (typeof window.saveRepo === 'function') {
      try { window.saveRepo(obj); return; } catch(e) {}
    }
    // fallback: write directly
    const el = document.getElementById('repo_data');
    if (el) el.textContent = JSON.stringify(obj, null, 2);
    try { document.dispatchEvent(new CustomEvent('repoDataUpdated', { detail: obj })); } catch(e){}
  }

  // --- Expose safe wrappers for appendEntry and appendLogText ---
  window.appendEntryObj = window.appendEntryObj || (function (obj) {
    if (window.SINGLE_BUNDLE && typeof window.SINGLE_BUNDLE.appendEntry === 'function') {
      try { window.SINGLE_BUNDLE.appendEntry(obj); return; } catch (e) { console.warn('pewpi-bridge: SINGLE_BUNDLE.appendEntry failed', e); }
    }
    // fallback: edit repo_data entries array
    const d = readRepoData();
    d.entries = d.entries || [];
    d.entries.push(obj);
    // also append a simple log line to log_txt
    d.log_txt = (d.log_txt || '') + `[${(obj.timestamp || new Date().toISOString())}] [${obj.type}] ${(obj.summary || obj.text || '')}\n`;
    writeRepoData(d);
  });

  window.appendLogText = window.appendLogText || (function (kind, text) {
    if (window.SINGLE_BUNDLE && typeof window.SINGLE_BUNDLE.appendLogText === 'function') {
      try { window.SINGLE_BUNDLE.appendLogText(kind, text); return; } catch (e) { console.warn('pewpi-bridge: SINGLE_BUNDLE.appendLogText failed', e); }
    }
    const d = readRepoData();
    d.log_txt = (d.log_txt || '') + `[${new Date().toISOString()}] [${kind || 'INFO'}] ${text}\n`;
    writeRepoData(d);
  });

  // Expose award/spend token wrappers mapped to SINGLE_BUNDLE if present
  window.awardTokenToUser = window.awardTokenToUser || function(username, entryId) {
    if (window.SINGLE_BUNDLE && typeof window.SINGLE_BUNDLE.awardTokenToUser === 'function') {
      return window.SINGLE_BUNDLE.awardTokenToUser(username, entryId);
    }
    // Minimal local implementation
    const d = readRepoData();
    d.wallets = d.wallets || {};
    if (!d.wallets[username]) d.wallets[username] = { id: username, balance: 0, last_awarded: 0, tokens: [] };
    const w = d.wallets[username];
    const now = Date.now();
    const elapsed = now - (w.last_awarded || 0);
    const COOLDOWN = 30 * 60 * 1000;
    if (elapsed >= COOLDOWN) {
      const code = genTokenCode();
      const tok = { code: code, issued_at: new Date(now).toISOString(), entry_id: entryId, spent: false };
      w.tokens.push(tok);
      w.balance = (w.balance || 0) + 1;
      w.last_awarded = now;
      writeRepoData(d);
      appendLogText('INFO', `Token issued ${code} to ${username}`);
      return { awarded: true, code, balance: w.balance };
    } else {
      return { awarded: false, cooldown_remaining: Math.ceil((COOLDOWN - elapsed) / 1000), balance: w.balance || 0 };
    }
  };

  // helper token generator used if needed
  function genTokenCode(){ const t = Date.now().toString(36).toUpperCase(); const r = Math.floor(Math.random()*900000+100000).toString(36).toUpperCase(); return `${t}-${r}`; }

  // Expose an API object for other scripts to call easily
  window.PEWPI_BRIDGE = {
    encryptText: window.encryptText,
    decryptText: window.decryptText,
    appendEntryObj: window.appendEntryObj,
    appendLogText: window.appendLogText,
    awardTokenToUser: window.awardTokenToUser,
    readRepoData,
    writeRepoData
  };

  // small readiness log
  console.log('pewpi-bridge: loaded — encryptText/decryptText and repo wrappers available');
})();