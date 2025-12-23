// File: modules/cart000_run_all.js
(function(){
  const id = 'cart000_run_all';
  const panel = document.createElement('div');
  panel.className='panel';
  panel.innerHTML = `
    <h2>Run All</h2>
    <p class="muted">Batch orchestrator for carts. TODO: define execution graph.</p>
    <div class="row">
      <button class="btn" id="${id}_dry">Dry run</button>
      <button class="btn" id="${id}_run">Execute</button>
    </div>
    <div class="log" id="${id}_log"></div>
  `;
  document.body.appendChild(panel);
  const log = document.getElementById(`${id}_log`);
  const l = m=>{ log.textContent += m+"\\n"; log.scrollTop = log.scrollHeight; };
  document.getElementById(`${id}_dry`).onclick = ()=> l('Dry run: listing carts…');
  document.getElementById(`${id}_run`).onclick = ()=> l('Execute: starting pipeline…');
  console.log(`${id} loaded`);
})();