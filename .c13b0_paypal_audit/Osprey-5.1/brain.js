(function(){
  console.log("🧠 Infinity Brain Online");

  const Brain={
    memory:[],
    boot(){
      const msg="🧠 Infinity Brain Online";
      console.log(msg);
      if(!document.getElementById("brain-status")){
        const b=document.createElement("div");
        b.id="brain-status";
        b.style.cssText="position:fixed;bottom:10px;left:10px;background:rgba(15,23,42,.9);color:#0ff;padding:8px 12px;border:1px solid #0ff;border-radius:8px;font-family:monospace;font-size:12px;z-index:9999";
        b.textContent=msg;
        document.body.appendChild(b);
      }
    },
    learn(x){this.memory.push(x);console.log('💾 Learned:',x);},
    think(q){return this.memory.length?"Based on memory: "+this.memory.at(-1):"No data yet.";},
    respond(o){console.log('💬',o);return o;}
  };

  window.InfinityBrain=Brain;
  document.addEventListener("DOMContentLoaded",()=>Brain.boot());
})();
