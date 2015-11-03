var component = require("./component.js"),
downloader = require("./downloader.js"),
launcher = require("./launcher.js"),
platform = require("./common/platform.js"),
config = require("./common/config.js"),
autostart = require("./autostart/autostart.js"),
controller = require("./ui/controller.js"),
thisInstallerVersion = require("./version.json"),
path = require("path"),
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
        var installerVersionChanged = compsMap.InstallerElectron.versionChanged;
        var installerDeployed = module.exports.isInstallerDeployed();
        var runningInstallerDir = module.exports.getRunningInstallerDir();
        
        if(installerVersionChanged) {
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
          if(installerVersionChanged) {
            module.exports.startInstallerUpdate().then(()=>{
              process.exit();
            });
          }
          else if(!installerDeployed) {
            return module.exports.updateInstaller(runningInstallerDir);
          }
        })
        .then(()=>{
          log.all("Installation finished");

          return launcher.launch().then(()=>{
            process.exit();
          });
        });
      })
      .catch((err)=>{
        log.all("Error: " + require("util").inspect(err));
      });
    });
  },
  checkInstallerUpdateStatus() {
    if(options.update) {
      return module.exports.updateInstaller(options.path);
    }
    else {
      return Promise.resolve();
    }
  },
  isInstallerDeployed() {
    return platform.fileExists(platform.getInstallerPath());
  },
  startInstallerUpdate() {
    var installerPkgTempPath = path.join(platform.getTempDir(), config.getComponentInfo("InstallerElectron").copy);
    var installerExePath = path.join(installerPkgTempPath, platform.getInstallerName());

    return platform.setFilePermissions(installerExePath, 0755)
    .then(()=>{
      platform.startProcess(installerExePath, ["--update", "--path", installerPkgTempPath]);
    });
  },
  updateInstaller(installerPkgTempPath) {
    return platform.copyFolderRecursive(installerPkgTempPath, path.join(platform.getInstallDir(), config.getComponentInfo("InstallerElectron").copy))
    .then(()=>{
      return autostart.createAutostart();
    });
  },
  getRunningInstallerDir() {
    var currPath = __dirname.split(path.sep);

    if(currPath[currPath.length - 2] === "resources" && currPath[currPath.length - 1] === "app") {
      currPath = currPath.slice(0, currPath.length - 2);
    }

    return path.join.apply(null, currPath);
  }
};
