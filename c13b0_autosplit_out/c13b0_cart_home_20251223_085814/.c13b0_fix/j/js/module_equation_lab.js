/* ============================================
   INFINITY OS — EQUATION LAB MODULE
   Micro-App Equation Builder v1
============================================ */

(function(){

    window.OctaveEquationLab = {
        list: [
            "Three-Body Problem",
            "Navier–Stokes Existence",
            "Yang–Mills Mass Gap",
            "Riemann–von Dyck Monster",
            "Birch–Swinnerton-Dyer",
            "K3 Surface Period",
            "Painlevé VI",
            "Ramanujan Tau Function",
            "Kissing Number 24D",
            "Ising 3D Ground State",
            "Hofstadter Butterfly",
            "Selberg Trace Formula",
            "Quantum Yang–Baxter",
            "Rogers–Ramanujan Continued Fraction",
            "Beilinson–Bloch",
            "Quantum Chromatic Polynomial",
            "SU(2) Moduli Space Volume",
            "Monster Moonshine J-Function"
        ],
        open(){
            const c = document.querySelector("#console");
            c.innerHTML += "\n\n=== EQUATION LAB ===\n";
            this.list.forEach((eq,i)=>{
                c.innerHTML += `(${i+1}) ${eq}\n`;
            });
            c.innerHTML += "\nSelect with: equation <number>\n";
            c.scrollTop = c.scrollHeight;
        },
        load(n){
            const c = document.querySelector("#console");
            const eq = this.list[n-1];
            c.innerHTML += `\n[Equation Selected] ${eq}\n`;
            c.innerHTML += "Opening micro-builder... 🔷\n";
            c.scrollTop = c.scrollHeight;
        }
    };

    window.addEventListener("message", (e)=>{
        if(!e.data) return;
    });

})();
