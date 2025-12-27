/**
 * static/js/token-client.js
 *
 * Client-only token wallet API that reads/writes wallets inside repo_data (the in-file store).
 * No server required. Tokens are unique codes attached to wallets. Cooldown enforced in-file.
 *
 * API:
 *  - TokenClient.init()  // optional
 *  - TokenClient.login(username)
 *  - TokenClient.getWallet(username)
 *  - TokenClient.award(username, entryId) -> { awarded, code, balance }
 *  - TokenClient.spend(username, code, entryId) -> { ok, balance, error }
 *  - TokenClient.list(username) -> wallet object
 */
(function(){
  if(window.TOKEN_CLIENT_LOADED) return;
  window.TOKEN_CLIENT_LOADED = true;

  function readRepo(){ try{ return JSON.parse(document.getElementById('repo_data').textContent); }catch(e){ return {meta:{}, wallets:{}, entries:[], log_txt:''}; } }
  function writeRepo(obj){ if(typeof window.saveRepoData === 'function'){ try{ window.saveRepoData(obj); return; }catch(e){} } const el=document.getElementById('repo_data'); if(el) el.textContent = JSON.stringify(obj, null, 2); }

  function ensureUser(username){
    const repo = readRepo(); repo.wallets = repo.wallets || {};
    if(!repo.wallets[username]) repo.wallets[username] = { id: username, balance: 0, last_awarded: 0, tokens: [] };
    writeRepo(repo);
    return repo.wallets[username];
  }

  function genCode(){ const t = Date.now().toString(36).toUpperCase(); const r = Math.floor(Math.random()*900000+100000).toString(36).toUpperCase(); return `${t}-${r}`; }

  function award(username, entryId){
    const repo = readRepo(); repo.wallets = repo.wallets || {}; if(!repo.wallets[username]) repo.wallets[username] = { id: username, balance:0, last_awarded:0, tokens:[] };
    const w = repo.wallets[username]; const now = Date.now(); const elapsed = now - (w.last_awarded||0); const COOLDOWN = 30*60*1000;
    if(elapsed >= COOLDOWN){
      const code = genCode();
      const tok = { code, issued_at: new Date(now).toISOString(), entry_id: entryId || null, spent:false };
      w.tokens.push(tok); w.balance = (w.balance||0) + 1; w.last_awarded = now;
      writeRepo(repo);
      if(typeof window.appendLogText === 'function') window.appendLogText('INFO', `Token ${code} issued to ${username}`);
      return { awarded:true, code, balance: w.balance };
    }
    return { awarded:false, cooldown_remaining: Math.ceil((COOLDOWN - elapsed)/1000), balance: w.balance||0 };
  }

  function spend(username, code, entryId){
    const repo = readRepo(); const w = (repo.wallets && repo.wallets[username]) || null;
    if(!w) return { ok:false, error:'no wallet' };
    const tok = (w.tokens||[]).find(t=>t.code === code);
    if(!tok) return { ok:false, error:'token not found' };
    if(tok.spent) return { ok:false, error:'already spent' };
    tok.spent = true; tok.spent_at = new Date().toISOString(); tok.spent_for = entryId || null;
    w.balance = Math.max(0, (w.balance||0) - 1);
    writeRepo(repo);
    if(typeof window.appendLogText === 'function') window.appendLogText('INFO', `Token ${code} spent by ${username}`);
    return { ok:true, balance: w.balance };
  }

  function list(username){
    const repo = readRepo();
    return (repo.wallets && repo.wallets[username]) || null;
  }

  window.TokenClient = { ensureUser, award, spend, list, genCode };
  console.log('token-client loaded');
})();