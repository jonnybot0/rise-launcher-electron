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
      return platform.mkdir(platform.getTempDir());
    })
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
          var runningDir = config.getRunningInstallerDir(),
          finalInstallerDir = platform.getInstallerDir(),
          runningInFinalInstallerDir = runningDir.toLowerCase().startsWith(finalInstallerDir.toLowerCase());

          if(installerVersionChanged) {
            log.all("updating installer version", "", "95%");

            return module.exports.startInstallerUpdate();
          }
          else if (!runningInFinalInstallerDir) {
            log.all("installing launcher", "", "95%");

            return module.exports.updateInstaller(runningDir);
          }
        })
        .then(()=>{
          if(module.exports.isOldInstallerDeployed()) {
            return module.exports.removeOldInstaller();
          }
        });
      })
      .catch((err)=>{
        if(err.userFriendlyMessage === messages.noNetworkConnection && platform.fileExists(platform.getInstallerPath())) {
          return Promise.resolve();
        }
        else {
          return Promise.reject(err);
        }
      });
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
  isOldInstallerDeployed() {
    return platform.fileExists(platform.getOldInstallerPath());
  },
  startInstallerUpdate() {
    var newInstallerPath = path.join(platform.getTempDir(), config.getComponentInfo("InstallerElectron").extractTo, platform.getInstallerName());
    return platform.setFilePermissions(newInstallerPath, 0755)
    .then(()=>{
      platform.startProcess(newInstallerPath, ["--unattended", "--update", "--path", path.join(platform.getTempDir(), config.getComponentInfo("InstallerElectron").extractTo)]);
    })
    .then(()=>{
      mainWindow.close();
      return new Promise(function haltForClose(res) {setTimeout(()=>{res();}, 1000);});
    });
  },
  updateInstaller(installerPkgTempPath) {
    var targetDir = path.join(platform.getInstallDir(), config.getComponentInfo("InstallerElectron").copy);

    return platform.copyFolderRecursive(installerPkgTempPath, targetDir);
  },
  removeOldInstaller() {
    return platform.deleteRecursively(platform.getOldInstallerPath());
  },
  getOptions() {
    return options;
  },
  setMainWindow(win) {
    mainWindow = win;
  }
};
