// File: server.js
const express = require('express'), cors = require('cors'), fs = require('fs'), fsp = fs.promises, path = require('path');
const { exec } = require('child_process');
const app = express(); app.use(cors()); app.use(express.json({limit:'2mb'})); app.use(express.static('.'));
const root = process.cwd(), dirs = ['tokens','search','logs'];

async function ensure(){ for(const d of dirs) await fsp.mkdir(path.join(root,d), {recursive:true}); }
function sh(cmd){ return new Promise((res,rej)=> exec(cmd,{cwd:root},(e,so,se)=> e ? rej(new Error((so||'')+(se||''))) : res((so||'')+(se||'')))); }

app.post('/api/tokens', async (req,res)=> {
  try { await ensure(); const t = req.body||{}; const fname = `${(t.name||'Token')}-${Date.now()}.json`;
    await fsp.writeFile(path.join(root,'tokens',fname), JSON.stringify(t,null,2));
    let log=''; try { log += await sh(`git add tokens/${fname}`); log += await sh(`git commit -m "token:${fname}"`); } catch(e){ log += `WARN ${e.message}`; }
    res.json({ ok:true, path:`tokens/${fname}`, log });
  } catch(e){ res.status(500).json({ error:e.message }); }
});

app.post('/api/search', async (req,res)=> {
  try { await ensure(); const a = req.body||{}; const fname = `search-${Date.now()}.json`;
    await fsp.writeFile(path.join(root,'search',fname), JSON.stringify(a,null,2));
    let log=''; try { log += await sh(`git add search/${fname}`); log += await sh(`git commit -m "search:${fname}"`); } catch(e){ log += `WARN ${e.message}`; }
    res.json({ ok:true, path:`search/${fname}`, log });
  } catch(e){ res.status(500).json({ error:e.message }); }
});

app.post('/api/logs', async (req,res)=> {
  try { await ensure(); const msg = req.body?.msg || ''; const fname = `log-${Date.now()}.txt`;
    await fsp.writeFile(path.join(root,'logs',fname), `${new Date().toISOString()} :: ${msg}\n`);
    let log=''; try { log += await sh(`git add logs/${fname}`); log += await sh(`git commit -m "log:${fname}"`); } catch(e){ log += `WARN ${e.message}`; }
    res.json({ ok:true, path:`logs/${fname}`, log });
  } catch(e){ res.status(500).json({ error:e.message }); }
});

const PORT = process.env.PORT || 3000;
ensure().then(()=> app.listen(PORT, ()=> console.log(`Backend on http://localhost:${PORT}`)));