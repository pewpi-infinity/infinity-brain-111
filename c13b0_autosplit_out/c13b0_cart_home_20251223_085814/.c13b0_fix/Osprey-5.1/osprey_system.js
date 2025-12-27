(function(){
  window.Osprey=window.Osprey||{
    version:"5.1",
    modules:{},
    register(n,d){this.modules[n]=d;console.log("[🪶] Module registered:",n)},
    list(){return Object.keys(this.modules)}
  };

  Osprey.register("bots",[
    {name:"Rogers",role:"Vice President",skills:["analysis","coordination","dialogue"]},
    {name:"Helios",role:"Energy Bot",skills:["energy","infrastructure","statistics"]},
    {name:"Gaia",role:"Food Bot",skills:["agriculture","logistics","sustainability"]},
    {name:"Aegis",role:"Health Bot",skills:["public health","data","protection"]},
    {name:"Athena",role:"Education Bot",skills:["learning","research","innovation"]}
  ]);

  document.addEventListener("DOMContentLoaded",()=>{
    if(document.getElementById("osprey-status"))return;
    const o=document.createElement("div");
    o.id="osprey-status";
    o.style.cssText="position:fixed;bottom:10px;right:10px;background:rgba(15,23,42,.9);color:#0ff;padding:10px 16px;border-radius:8px;font-family:monospace;font-size:13px;border:1px solid #0ff;z-index:9999";
    o.textContent="🦅 Osprey "+Osprey.version+" • Modules: "+Osprey.list().join(", ");
    document.body.appendChild(o);
  });
})();
