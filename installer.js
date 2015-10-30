var component = require("./component.js"),
downloader = require("./downloader.js"),
launcher = require("./launcher.js"),
platform = require("./common/platform.js"),
controller = require("./ui/controller.js"),
yargs = require("yargs"),
options = yargs.parse(process.argv.slice(1));

module.exports = {
  begin() {
    log.all("Beginning install");

    module.exports.checkInstallerUpdateStatus()
    .then(()=>{
      return platform.mkdir(platform.getInstallDir());
    })
    .then(()=>{
      log.all("Fetching components list");

      return component.getComponents().then((compsMap)=>{
        var components = component.getComponentNames().map((name)=>{ return compsMap[name]; });
        var changedComponents = components.filter((c)=>{ return c.versionChanged; });
        var changedNames = changedComponents.map((c)=>{ return c.name; });
        
        if(compsMap.InstallerElectron.versionChanged) {
          log.all("Upgrading installer");

          changedComponents = [compsMap.InstallerElectron];
          changedNames = ["Installer"];
        }

        log.all("Downloading " + changedNames);

        return downloader.downloadComponents(changedComponents)
        .then(()=>{
          log.all("Extracting " + changedNames);

          return downloader.extractComponents(changedComponents);
        })
        .then(()=>{
          log.all("Installing " + changedNames);

          return downloader.installComponents(changedComponents);
        })
        .then(()=>{
          if(compsMap.InstallerElectron.versionChanged) {
            process.exit();
          }
          else {
            log.all("Installation finished");

            return launcher.launch().then(()=>{
              process.exit();
            });
          }
        });
      })
      .catch((err)=>{
        log.all("Error: " + require("util").inspect(err));
      });
    });
  },
  checkInstallerUpdateStatus() {
    if(options.update) {
      return downloader.updateInstaller(options.path, options.version);
    }
    else {
      return Promise.resolve();
    }
  }
};
