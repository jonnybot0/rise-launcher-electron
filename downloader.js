var platform = require("./common/platform.js"),
network = require("./common/network.js"),
config = require("./common/config.js"),
fs = require("fs"),
path = require("path");

var componentsZipInfo = {
  "Browser": { extractTo: "", copy: "chromium" },
  "Cache": { extractTo: "RiseCache", copy: "RiseCache" },
  "InstallerElectron": { extractTo: "Installer", copy: "Installer" },
  "Java": { extractTo: "JRE", copy: "JRE" },
  "Player": { extractTo: "", copy: "RisePlayer.jar" }
};

module.exports = {
  downloadComponents(components) {
    var promises = components.map((c)=>{
      return network.downloadFile(c.url)
      .then((localPath)=>{
        c.localPath = localPath;
        return c;
      })
      .catch((err)=>{
        return Promise.reject({ message: "Error downloading " + c.url, error: err });
      });
    });

    return Promise.all(promises);
  },
  extractComponents(components) {
    var promises = components.map((c)=>{
      return module.exports.unzipFile(c.localPath, componentsZipInfo[c.name].extractTo).then(()=>{
        return c;
      });
    });

    return Promise.all(promises);
  },
  installComponents(components) {
    var promises = components.map((c)=>{
      return module.exports.installComponent(c);
    });

    return Promise.all(promises);
  },
  installComponent(component) {
    if(component.name === "InstallerElectron") {
      return module.exports.startInstallerUpdate(component);
    }
    else {
      var source = path.join(platform.getTempDir(), componentsZipInfo[component.name].copy);
      var destination = path.join(platform.getInstallDir(), componentsZipInfo[component.name].copy);

      if(component.name === "Browser") {
        source = path.join(platform.getTempDir(), platform.isWindows() ? "chrome-win32" : "chrome-linux");
        destination = path.join(platform.getInstallDir(), platform.isWindows() ? "chromium" : "chrome-linux");

      }
      else if(component.name === "Java" && !platform.isWindows()) {
        source = source + "/jre";
        destination = destination.replace("JRE", "jre");
      }

      return platform.copyFolderRecursive(source, destination).then(()=>{
        component.destination = destination;
        return config.saveVersion(component.name, component.remoteVersion);
      })
      .then(()=>{
        if(!platform.isWindows() && component.name === "Browser") {
          return platform.setFilePermissions(destination + "/chrome", 0755);
        }
        else if(!platform.isWindows() && component.name === "Java") {
          return platform.setFilePermissions(destination + "/bin/java", 0755);
        }
      })
      .then(()=>{
        return component;
      })
      .catch((err)=>{
        return Promise.reject({ message: "Error copying " + source + " to " + destination, error: err });
      });
    }
  },
  startInstallerUpdate(component) {
    var installerPkgTempPath = path.join(platform.getTempDir(), componentsZipInfo.InstallerElectron.copy);
    var installerExePath = path.join(installerPkgTempPath, platform.getInstallerName());
    var atomRen = path.join(installerPkgTempPath, "resources", "atom.ren");
    var atomAsar = path.join(installerPkgTempPath, "resources", "atom.asar");

    return platform.renameFile(atomRen, atomAsar)
    .then(()=>{
      return platform.setFilePermissions(installerExePath, 0755);
    })
    .then(()=>{
      platform.startProcess(installerExePath, ["--update", "--version", component.remoteVersion, "--path", installerPkgTempPath]);
    });
  },
  updateInstaller(installerPkgTempPath, version) {
    return platform.copyFolderRecursive(installerPkgTempPath, path.join(platform.getInstallDir(), componentsZipInfo.InstallerElectron.copy))
    .then(()=>{
      return config.saveVersion("InstallerElectron", version);
    });
  },
  unzipFile(filePath, subdir) {
    return platform.extractZipTo(filePath, path.join(platform.getTempDir(), subdir), true)
    .catch((err)=>{
      return Promise.reject({ message: "Error unzipping " + filePath, error: err });
    });
  }
};
