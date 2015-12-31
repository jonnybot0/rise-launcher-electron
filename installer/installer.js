var component = requireRoot("installer/component.js"),
downloader = requireRoot("installer/downloader.js"),
config = requireRoot("installer/config.js"),
platform = require("rise-common-electron").platform,
path = require("path"),
yargs = require("yargs"),
options = yargs.parse(process.argv.slice(1)),
mainWindow;

module.exports = {
  begin() {
    log.all("beginning install", "", "5%");
    return module.exports.checkInstallerUpdateStatus()
    .then(()=>{
      return platform.mkdir(platform.getInstallDir());
    })
    .then(()=>{
      return platform.deleteRecursively(platform.getOldInstallerPath());
    })
    .then(()=>{
      log.all("checking components", "", "10%");

      return component.getComponents().then((compsMap)=>{
        var components = component.getComponentNames().map((name)=>{ return compsMap[name]; });
        var changedComponents = components.filter((c)=>{ return c.versionChanged; });
        var changedNames = changedComponents.map((c)=>{ return c.name; }).toString();
        var installerVersionChanged = compsMap.InstallerElectron.versionChanged;
        var installerDeployed = module.exports.isInstallerDeployed();
        var runningInstallerDir = module.exports.getRunningInstallerDir();
        
        if(compsMap.InstallerElectron.versionChanged) {
          log.all("upgrading installer", "", "20%");

          changedComponents = [compsMap.InstallerElectron];
          changedNames = "installer";
        }

        log.all("downloading components", changedNames, "30%");

        return downloader.downloadComponents(changedComponents)
        .then(()=>{
          log.all("extracting", changedNames, "50%");

          return downloader.extractComponents(changedComponents);
        })
        .then(()=>{
          log.all("stopping player and cache", changedNames, "52%");
          return platform.killJava();
        })
        .then(()=>{
          log.all("stopping chromium", changedNames, "56%");
          return platform.killChromium();
        })
        .then(()=>{
          return platform.waitForMillis(2500);
        })
        .then(()=>{
          log.all("removing previous versions", changedNames, "60%");

          return downloader.removePreviousVersions(changedComponents);
        })
        .then(()=>{
          log.all("installing", changedNames, "90%");

          return downloader.installComponents(changedComponents);
        })
        .then(()=>{
          if(installerVersionChanged) {
            log.all("updating installer version", "", "95%");

            return module.exports.startInstallerUpdate().then(()=>{
              mainWindow.close();
              return new Promise((res)=>{
                setTimeout(()=>{res();}, 1000);
              });
            });
          }
          else if(!installerDeployed) {
            log.all("installing launcher", "", "95%");

            return module.exports.updateInstaller(runningInstallerDir);
          }
        })
        .then(()=>{
          if(module.exports.isOldInstallerDeployed()) {
            return module.exports.removeOldInstaller();
          }
        });
      });
    })
    .catch((err)=>{
      log.error(require("util").inspect(err), err.userFriendlyMessage || messages.unknown);
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
    return platform.fileExists(platform.getInstallerPath());
  },
  isOldInstallerDeployed() {
    return platform.fileExists(platform.getOldInstallerPath());
  },
  startInstallerUpdate() {
    var newInstallerPath = path.join(platform.getTempDir(), config.getComponentInfo("InstallerElectron").extractTo, platform.getInstallerName());
    return platform.setFilePermissions(newInstallerPath, 0755)
    .then(()=>{
      platform.startProcess(newInstallerPath, ["--unattended", "--update", "--path", path.join(platform.getTempDir(), config.getComponentInfo("InstallerElectron").extractTo)]);
    });
  },
  updateInstaller(installerPkgTempPath) {
    return platform.copyFolderRecursive(installerPkgTempPath, path.join(platform.getInstallDir(), config.getComponentInfo("InstallerElectron").copy));
  },
  removeOldInstaller() {
    return platform.deleteRecursively(platform.getOldInstallerPath());
  },
  getRunningInstallerDir() {
    var currPath = platform.getCwd().split(path.sep);
    var pathPrefix = platform.getCwd().startsWith(path.sep) ? path.sep : "";

    if(currPath[currPath.length - 2] === "resources" && currPath[currPath.length - 1] === "app") {
      currPath = currPath.slice(0, currPath.length - 2);
    }

    return pathPrefix + path.join.apply(null, currPath);
  },
  getOptions() {
    return options;
  },
  setMainWindow(win) {
    mainWindow = win;
  }
};
