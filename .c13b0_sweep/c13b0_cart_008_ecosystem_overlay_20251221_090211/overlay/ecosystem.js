(function () {
  if (document.getElementById("c13b0-ecosystem")) return;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "./overlay/ecosystem.css";
  document.head.appendChild(link);

  const box = document.createElement("div");
  box.id = "c13b0-ecosystem";

  box.innerHTML = `
    <h4>🧱 Living Ecosystem</h4>
    <p>
      This page is a <b>brick</b>.<br>
      Every brick can expand into its own site.<br>
      All bricks connect into a growing system.
    </p>
    <button id="c13b0-more">Learn more</button>
  `;

  document.body.appendChild(box);

  document.getElementById("c13b0-more").onclick = () => {
    alert(
      "This page is part of the PewPi / C13B0 ecosystem.\n\n" +
      "Each block can grow into a new site,\n" +
      "each site becomes a stage,\n" +
      "and stages form a world map."
    );
  };
})();
