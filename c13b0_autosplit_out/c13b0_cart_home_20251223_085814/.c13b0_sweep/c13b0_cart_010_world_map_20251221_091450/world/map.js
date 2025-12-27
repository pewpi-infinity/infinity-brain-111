fetch("../data/ecosystem.json")
  .then(r => r.json())
  .then(data => {
    const map = document.getElementById("map");

    data.worlds.forEach(world => {
      const w = document.createElement("div");
      w.className = "world";
      w.innerHTML = `<h2>🌍 ${world.name}</h2>`;

      world.stages.forEach(stage => {
        const s = document.createElement("div");
        s.className = "stage";
        s.innerHTML = `<h3>🎮 ${stage.name}</h3>`;

        stage.bricks.forEach(brick => {
          const b = document.createElement("div");
          b.className = "brick";
          b.textContent = brick.name;
          s.appendChild(b);
        });

        w.appendChild(s);
      });

      map.appendChild(w);
    });
  });
