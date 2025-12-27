// File: modules/cart001A_infinity_runcommands.js
(function(){ const id='cart001A_infinity_runcommands';
  const p=document.createElement('div'); p.className='panel';
  p.innerHTML=`<h2>Infinity Run Commands</h2><p class="muted">Command palette.</p>
  <div class="row"><input id="${id}_cmd" placeholder="Type command"><button class="btn" id="${id}_run">Run</button></div>
  <div class="log" id="${id}_log"></div>`;
  document.body.appendChild(p);
  const log=document.getElementById(`${id}_log`);
  document.getElementById(`${id}_run`).onclick=()=>{ const cmd=document.getElementById(`${id}_cmd`).value; log.textContent+=`> ${cmd}\\n`; };
  console.log(`${id} loaded`);
})();