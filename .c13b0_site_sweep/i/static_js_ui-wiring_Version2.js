/**
 * static/js/ui-wiring.js
 *
 * Minimal UI glue that wires the existing single-file index.html terminal to the new modules:
 * - uses appendEntryObj / appendLogText for writes
 * - uses encryptText/decryptText via pewpi-bridge
 * - awards tokens via TokenClient.award
 * - ensures EmbeddedWriter has rebuilt log_txt
 *
 * Include this after pewpi-bridge.js and embedded-writer.js.
 */
(function(){
  if(window.UI_WIRING_LOADED) return;
  window.UI_WIRING_LOADED = true;

  function el(id){ return document.getElementById(id); }
  const input = el('inputLine'), send = el('sendBtn'), term = el('terminal'), list = el('entryList');

  function appendToTerminal(s){
    const d = document.createElement('div'); d.textContent = s; term.appendChild(d); term.scrollTop = term.scrollHeight;
    // let EmbeddedWriter refresh log preview
    if(window.EmbeddedWriter && typeof window.EmbeddedWriter.rebuild === 'function') window.EmbeddedWriter.rebuild();
  }

  async function process(line){
    if(!line || !line.trim()) return;
    if(line.startsWith('/')){
      const parts = line.split(/\s+/); const cmd = parts[0].toLowerCase();
      if(cmd === '/help'){ appendToTerminal('Commands: /help /login <id> /whoami /list /open <id> /spend <code> [entry] /export html /export b64'); return; }
      if(cmd === '/login'){ const id = parts[1]; if(!id){ appendToTerminal('Usage: /login <id>'); return; } const repo = window.PEWPI_BRIDGE.readRepoData ? window.PEWPI_BRIDGE.readRepoData() : JSON.parse(document.getElementById('repo_data').textContent); repo.meta = repo.meta||{}; repo.meta.current_user = id; window.PEWPI_BRIDGE.writeRepoData ? window.PEWPI_BRIDGE.writeRepoData(repo) : document.getElementById('repo_data').textContent = JSON.stringify(repo,null,2); if(window.TokenClient) TokenClient.ensureUser(id); appendToTerminal('Logged in: '+id); return; }
      if(cmd === '/whoami'){ const repo = window.PEWPI_BRIDGE.readRepoData ? window.PEWPI_BRIDGE.readRepoData() : JSON.parse(document.getElementById('repo_data').textContent); appendToTerminal('User: ' + ((repo.meta && repo.meta.current_user) || '(none)')); return; }
      if(cmd === '/list'){ const repo = window.PEWPI_BRIDGE.readRepoData ? window.PEWPI_BRIDGE.readRepoData() : JSON.parse(document.getElementById('repo_data').textContent); appendToTerminal('Entries:\\n' + (repo.entries||[]).map(e=>`${e.id} ${e.type} ${e.timestamp}`).join('\\n')); return; }
      if(cmd === '/open'){ const id = parts[1]; if(!id){ appendToTerminal('Usage: /open <id>'); return; } if(window.SINGLE_BUNDLE && typeof window.SINGLE_BUNDLE.openEntry === 'function'){ window.SINGLE_BUNDLE.openEntry(id); } else { appendToTerminal('Open not available.'); } return; }
      if(cmd === '/spend'){ const code = parts[1]; const entryId = parts[2]||null; const repo = window.PEWPI_BRIDGE.readRepoData(); const cur = (repo.meta && repo.meta.current_user); if(!cur){ appendToTerminal('Login first'); return; } const res = window.TokenClient ? TokenClient.spend(cur, code, entryId) : { ok:false, error:'TokenClient missing' }; appendToTerminal(res.ok ? ('Spent. Balance: '+res.balance) : ('Spend failed: '+res.error)); return; }
      // /export handled by existing page commands; let them run
      appendToTerminal('Unknown command');
      return;
    }

    // message path
    const secretMode = document.getElementById('btnSecret').classList.contains('active');
    if(secretMode){
      // encrypt and store
      let pass = prompt('Enter passphrase to encrypt message (not stored):');
      if(!pass){ appendToTerminal('Encrypt aborted'); return; }
      try{
        const cipher = await window.encryptText(line, pass);
        const entry = { id: (Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8)), type: 'encoded', cipher, timestamp: new Date().toISOString() };
        window.appendEntryObj(entry);
        appendToTerminal('Secret stored: ' + entry.id);
        // award token
        const repo = window.PEWPI_BRIDGE.readRepoData ? window.PEWPI_BRIDGE.readRepoData() : JSON.parse(document.getElementById('repo_data').textContent);
        const cur = (repo.meta && repo.meta.current_user);
        if(cur && window.TokenClient){ const aw = TokenClient.award(cur, entry.id); appendToTerminal(aw.awarded ? ('Token: '+aw.code+' balance:'+aw.balance) : ('Not awarded (cooldown) balance:'+aw.balance)); }
      }catch(e){ appendToTerminal('Encrypt failed: ' + (e.message||e)); }
    } else {
      // conversation: store user + digest
      const userEntry = { id: uid(), type: 'user', text: line, timestamp: new Date().toISOString() };
      window.appendEntryObj(userEntry);
      const digest = line.split(/\s+/).slice(0,40).join(' ');
      const aiEntry = { id: uid(), type: 'ai', summary: 'Octave distilled: ' + digest, timestamp: new Date().toISOString() };
      window.appendEntryObj(aiEntry);
      appendToTerminal('Conversation stored (digest).');
      // award token
      const repo = window.PEWPI_BRIDGE.readRepoData ? window.PEWPI_BRIDGE.readRepoData() : JSON.parse(document.getElementById('repo_data').textContent);
      const cur = (repo.meta && repo.meta.current_user);
      if(cur && window.TokenClient){ const aw = TokenClient.award(cur, null); appendToTerminal(aw.awarded ? ('Token: '+aw.code+' balance:'+aw.balance) : ('Not awarded (cooldown) balance:'+aw.balance)); }
    }
  }

  // helpers used above
  function uid(){ return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8); }
  function appendToTerminal(s){ const d=document.createElement('div'); d.textContent=s; term.appendChild(d); term.scrollTop = term.scrollHeight; if(window.EmbeddedWriter && typeof window.EmbeddedWriter.rebuild === 'function') window.EmbeddedWriter.rebuild(); }

  // wire send/button
  send.addEventListener('click', ()=>{ const v=input.value; process(v); input.value=''; });
  input.addEventListener('keydown', (e)=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); const v=input.value; process(v); input.value=''; } });

  // expose small API
  window.UI_WIRING = { processLine: process };
  console.log('ui-wiring loaded');
})();