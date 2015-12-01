var component = require("./component.js"),
downloader = require("./downloader.js"),
launcher = require("./launcher.js"),
platform = require("./common/platform.js"),
config = require("./common/config.js"),
networkVerification = require("./network-check.js"),
autostart = require("./autostart/autostart.js"),
optimization = require("./os-optimization.js"),
thisInstallerVersion = require("./version.json"),
path = require("path"),
yargs = require("yargs"),
options = yargs.parse(process.argv.slice(1));

module.exports = {
  begin() {
    log.all("beginning install");

    return module.exports.checkInstallerUpdateStatus()
    .then(()=>{
      return platform.mkdir(platform.getInstallDir());
    })
    .then(()=>{
      return platform.deleteRecursively(platform.getOldInstallerPath());
    })
    .then(()=>{
      log.all("fetching components list");

      return component.getComponents().then((compsMap)=>{
        var components = component.getComponentNames().map((name)=>{ return compsMap[name]; });
        var changedComponents = components.filter((c)=>{ return c.versionChanged; });
        var changedNames = changedComponents.map((c)=>{ return c.name; }).toString();
        var installerVersionChanged = compsMap.InstallerElectron.versionChanged;
        var installerDeployed = module.exports.isInstallerDeployed();
        var runningInstallerDir = module.exports.getRunningInstallerDir();
        
        if(compsMap.InstallerElectron.versionChanged) {
          log.all("upgrading installer");

          changedComponents = [compsMap.InstallerElectron];
          changedNames = "installer";
        }

        log.all("downloading components", changedNames);

        return downloader.downloadComponents(changedComponents)
        .then(()=>{
          log.all("extracting", changedNames);

          return downloader.extractComponents(changedComponents);
        })
        .then(()=>{
          log.all("removing previous versions", changedNames);

          return downloader.removePreviousVersions(changedComponents);
        })
        .then(()=>{
          log.all("installing", changedNames);

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
          log.all("install complete");

          return launcher.launch().then(()=>{
            process.exit();
          });
        });
      });
    })
    .catch((err)=>{
      log.error(require("util").inspect(err), messages.unknown);
      return Promise.reject(err);
    });
  },
  checkInstallerUpdateStatus() {
    if(module.exports.getOptions().update) {
      return module.exports.updateInstaller(module.exports.getOptions().path);
    }
    else {
      return Promise.resolve();
    }
  },
  isInstallerDeployed() {
    console.log("platform.getInstallerPath()", platform.getInstallerPath());

    return platform.fileExists(platform.getInstallerPath());
  },
  startInstallerUpdate() {
    return platform.setFilePermissions(platform.getInstallerPath(), 0755)
    .then(()=>{
      platform.startProcess(platform.getInstallerPath(), ["--update", "--path", platform.getInstallerDir()]);
    });
  },
  updateInstaller(installerPkgTempPath) {
    return platform.copyFolderRecursive(installerPkgTempPath, path.join(platform.getInstallDir(), config.getComponentInfo("InstallerElectron").copy))
    .then(()=>{
      return autostart.createAutostart();
    })
    .then(()=>{
      return optimization.updateSettings();
    });
  },
  getRunningInstallerDir() {
    var currPath = module.exports.getCwd().split(path.sep);
    var pathPrefix = module.exports.getCwd().startsWith(path.sep) ? path.sep : "";

    if(currPath[currPath.length - 2] === "resources" && currPath[currPath.length - 1] === "app") {
      currPath = currPath.slice(0, currPath.length - 2);
    }

    return pathPrefix + path.join.apply(null, currPath);
  },
  getCwd() {
    return __dirname;
  },
  getOptions() {
    return options;
  }
};
