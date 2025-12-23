/**
 * static/js/embedded-writer.js
 *
 * Keeps repo_data.log_txt up-to-date from entries, deduplicates, and optionally
 * mirrors recent lines to CommitClient.send or POST /log.
 *
 * Load this after the page embeds repo_data (index.html) and after pewpi-bridge.
 */
(function(){
  if(window.EMBEDDED_WRITER_LOADED) return;
  window.EMBEDDED_WRITER_LOADED = true;

  const INTERVAL = 3000;
  const MAX_PUSH_LINES = 50;

  function loadRepo(){ try{ return JSON.parse(document.getElementById('repo_data').textContent); }catch(e){ return {meta:{}, wallets:{}, entries:[], log_txt:'', embedded_files:{}}; } }
  function saveRepo(obj){
    if(typeof window.saveRepoData === 'function'){ try{ window.saveRepoData(obj); return; }catch(e){} }
    const el = document.getElementById('repo_data'); if(el) el.textContent = JSON.stringify(obj, null, 2);
    try{ document.dispatchEvent(new CustomEvent('repoDataUpdated', {detail: obj})); }catch(e){}
  }

  function buildLines(entries){
    const lines = [];
    for(const e of entries){
      const kind = (e.type && e.type.toUpperCase()) || 'INFO';
      const body = e.summary || e.text || '';
      lines.push(`[${e.timestamp||''}] [${kind}] ${body}`);
    }
    return lines;
  }

  function dedupe(lines){
    const seen = new Set(); const out = [];
    for(const l of lines){
      if(!seen.has(l)){ seen.add(l); out.push(l); }
    }
    return out;
  }

  async function rebuildIfNeeded(){
    const repo = loadRepo();
    const lines = buildLines(repo.entries || []);
    const deduped = dedupe(lines).join('\n') + (lines.length ? '\n' : '');
    if((repo.log_txt||'') !== deduped){
      repo.log_txt = deduped;
      saveRepo(repo);
      document.dispatchEvent(new CustomEvent('embeddedLogUpdated',{detail:{log_txt:deduped}}));
      await tryPushRecentLines(deduped);
      return true;
    }
    return false;
  }

  async function tryPushRecentLines(logTxt){
    try{
      const lines = logTxt.split('\n').filter(Boolean);
      const recent = lines.slice(-MAX_PUSH_LINES).join('\n');
      if(!recent) return;
      // CommitClient (if configured)
      if(window.CommitClient && typeof window.CommitClient.send === 'function'){
        try{ await window.CommitClient.send(`[embedded-log]\n${recent}`); }catch(e){ /* ignore */ }
      }
      // /log endpoint
      try{
        await fetch('/log', { method:'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ text: recent, kind: 'IN' }) });
      }catch(e){}
    }catch(e){}
  }

  // observer on repo_data so we react fast to changes
  function observeRepo(){
    const el = document.getElementById('repo_data');
    if(!el) return;
    const obs = new MutationObserver(()=>{ try{ rebuildIfNeeded(); }catch(e){} });
    obs.observe(el, { childList: true, characterData: true, subtree: true });
    document.addEventListener('repoDataUpdated', ()=>{ try{ rebuildIfNeeded(); }catch(e){} });
  }

  // periodic reconciliation
  setTimeout(()=>{ observeRepo(); rebuildIfNeeded(); setInterval(rebuildIfNeeded, INTERVAL); }, 200);

  window.EmbeddedWriter = {
    rebuild: rebuildIfNeeded,
    pushRecent: tryPushRecentLines,
    buildLines
  };

  console.log('embedded-writer loaded');
})();