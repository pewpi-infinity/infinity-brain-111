(function () {
  if (document.getElementById("c13b0-buy-block")) return;

  const style = document.createElement("style");
  fetch("inject/buy_block.css").then(r => r.text()).then(t => style.innerHTML = t);

  const wrap = document.createElement("div");
  fetch("inject/buy_block.html").then(r => r.text()).then(t => {
    wrap.innerHTML = t;
    document.body.appendChild(style);
    document.body.appendChild(wrap);
  });
})();
