/**
 * static/js/pewpi-bridge.js
 *
 * Global bridge to ensure encryptText/decryptText and repo_data helpers exist.
 * Provides safe fallbacks and repo_data wrappers so other scripts (UI, token, writer)
 * can rely on consistent APIs.
 *
 * Security: does NOT send passphrases anywhere. All repo_data writes happen in-page;
 * persisting changes to GitHub requires you to /export html (copy+paste) or use your workflow.
 */
(function(){
  // If already loaded, no-op
  if(window.PEWPI_BRIDGE_LOADED) return;
  window.PEWPI_BRIDGE_LOADED = true;

  // Base64 helpers
  function b64ToUint8(b64){
    const bin = atob(b64); const u = new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++) u[i]=bin.charCodeAt(i); return u;
  }
  function uint8ToB64(u8){
    let s=''; for(let i=0;i<u8.length;i++) s+=String.fromCharCode(u8[i]); return btoa(s);
  }

  // PBKDF2->AES-GCM fallback implementation
  async function deriveKey(pass, salt, iterations=200000){
    const enc = new TextEncoder();
    const base = await crypto.subtle.importKey('raw', enc.encode(pass), {name:'PBKDF2'}, false, ['deriveKey']);
    return crypto.subtle.deriveKey({name:'PBKDF2', salt, iterations, hash:'SHA-256'}, base, {name:'AES-GCM', length:256}, true, ['encrypt','decrypt']);
  }
  async function fallbackEncryptText(plain, pass, iterations=200000){
    const enc = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(pass, salt, iterations);
    const ct = await crypto.subtle.encrypt({name:'AES-GCM', iv}, key, enc.encode(plain));
    const ctArr = new Uint8Array(ct);
    const combined = new Uint8Array(salt.length + iv.length + ctArr.length);
    combined.set(salt,0); combined.set(iv,salt.length); combined.set(ctArr,salt.length+iv.length);
    return uint8ToB64(combined);
  }
  async function fallbackDecryptText(b64, pass, iterations=200000){
    const arr = b64ToUint8(b64);
    if(arr.length < 16+12+16) throw new Error('Encoded data too short or invalid');
    const salt = arr.slice(0,16), iv = arr.slice(16,28), ct = arr.slice(28);
    const key = await deriveKey(pass, salt, iterations);
    const plain = await crypto.subtle.decrypt({name:'AES-GCM', iv}, key, ct);
    return new TextDecoder().decode(plain);
  }

  // Expose encryptText / decryptText (use existing in-page PEWPI_CRYPTO if present)
  window.encryptText = window.encryptText || (async (plain, pass, iterations) => {
    if(window.PEWPI_CRYPTO && typeof window.PEWPI_CRYPTO.encryptText === 'function'){
      return window.PEWPI_CRYPTO.encryptText(plain, pass, iterations);
    }
    return fallbackEncryptText(plain, pass, iterations || 200000);
  });

  window.decryptText = window.decryptText || (async (b64, pass, iterations) => {
    if(window.PEWPI_CRYPTO && typeof window.PEWPI_CRYPTO.decryptText === 'function'){
      return window.PEWPI_CRYPTO.decryptText(b64, pass, iterations);
    }
    return fallbackDecryptText(b64, pass, iterations || 200000);
  });

  // repo_data read/write helpers
  function readRepoData(){
    const el = document.getElementById('repo_data');
    if(!el) return {meta:{}, wallets:{}, entries:[], log_txt:'', embedded_files:{}};
    try{ return JSON.parse(el.textContent || el.innerText); }catch(e){ return {meta:{}, wallets:{}, entries:[], log_txt:'', embedded_files:{}}; }
  }
  function writeRepoData(obj){
    // prefer existing saveRepoData/saveRepo APIs if present
    if(typeof window.saveRepoData === 'function'){
      try{ window.saveRepoData(obj); return; }catch(e){}
    }
    if(typeof window.saveRepo === 'function'){
      try{ window.saveRepo(obj); return; }catch(e){}
    }
    const el = document.getElementById('repo_data');
    if(el) el.textContent = JSON.stringify(obj, null, 2);
    try{ document.dispatchEvent(new CustomEvent('repoDataUpdated', {detail: obj})); }catch(e){}
  }

  // Append helpers for entries and logs (safe idempotent)
  window.appendEntryObj = window.appendEntryObj || function(obj){
    try{
      const d = readRepoData();
      d.entries = d.entries || [];
      d.entries.push(obj);
      // Also append a textual log line to log_txt for full-history
      d.log_txt = (d.log_txt || '') + `[${obj.timestamp || new Date().toISOString()}] [${obj.type}] ${obj.summary || obj.text || ''}\n`;
      writeRepoData(d);
    }catch(e){
      console.error('appendEntryObj failed', e);
    }
  };

  window.appendLogText = window.appendLogText || function(kind, text){
    const d = readRepoData();
    d.log_txt = (d.log_txt || '') + `[${new Date().toISOString()}] [${kind||'INFO'}] ${text}\n`;
    writeRepoData(d);
  };

  // token helper (minimal, stored inside repo_data.wallets)
  window.awardTokenToUser = window.awardTokenToUser || function(username, entryId){
    const d = readRepoData(); d.wallets = d.wallets||{};
    if(!d.wallets[username]) d.wallets[username] = { id:username, balance:0, last_awarded:0, tokens:[] };
    const w = d.wallets[username]; const now = Date.now(); const elapsed = now - (w.last_awarded||0); const COOLDOWN = 30*60*1000;
    if(elapsed >= COOLDOWN){
      const code = genTokenCode();
      const tok = { code, issued_at: new Date(now).toISOString(), entry_id: entryId || null, spent: false };
      w.tokens.push(tok); w.balance = (w.balance||0)+1; w.last_awarded = now; writeRepoData(d); window.appendLogText('INFO', `Token ${code} issued to ${username}`); return { awarded:true, code, balance:w.balance };
    }
    return { awarded:false, cooldown_remaining: Math.ceil((COOLDOWN-elapsed)/1000), balance:w.balance||0 };
  };

  function genTokenCode(){ const t = Date.now().toString(36).toUpperCase(); const r = Math.floor(Math.random()*900000+100000).toString(36).toUpperCase(); return `${t}-${r}`; }

  // expose bridge object
  window.PEWPI_BRIDGE = {
    encryptText: window.encryptText,
    decryptText: window.decryptText,
    readRepoData,
    writeRepoData,
    appendEntryObj: window.appendEntryObj,
    appendLogText: window.appendLogText,
    awardTokenToUser: window.awardTokenToUser
  };

  console.log('pewpi-bridge loaded');
})();