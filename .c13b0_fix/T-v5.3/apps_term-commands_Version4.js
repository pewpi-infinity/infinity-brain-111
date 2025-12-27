/* Extra commands and preinstalled utilities for Exec */
(function(){
  window.PackageManager = {
    packages: {
      "hello": { version: "1.0", files: { "hello.sh": 'console.log("hello world")' } },
      "py-samples": { version: "1.0", files: { "hello.py": 'print("hello from python")' } }
    },
    async list(){ return Object.keys(this.packages).join("\n"); },
    async install(name){
      if (!this.packages[name]) return "Package not found: " + name;
      const pkg = this.packages[name];
      for(const path in pkg.files) Exec.writeFile(path, pkg.files[path]);
      return `Installed ${name} v${pkg.version}`;
    }
  };
})();