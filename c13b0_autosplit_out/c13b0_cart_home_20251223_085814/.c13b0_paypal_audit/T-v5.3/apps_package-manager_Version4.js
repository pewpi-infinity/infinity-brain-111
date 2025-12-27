/* Simple mock pkg command wired to PackageManager */
(function(){
  async function pkgHandler(args){
    if (!args || args.length === 0) return "pkg: list | install <name>";
    const sub = args[0];
    if (sub === "list") return PackageManager.list();
    if (sub === "install") {
      if (!args[1]) return "Usage: pkg install <name>";
      return await PackageManager.install(args[1]);
    }
    return "pkg: unknown subcommand";
  }
  // register with Exec by exposing a command wrapper
  document.addEventListener("DOMContentLoaded", () => {
    if (window.Exec) {
      const old = Exec.handle;
      Exec.handle = async function(cmd,args){
        if (cmd === "pkg") return await pkgHandler(args);
        return await old.call(this, cmd, args);
      };
    }
  });
})();