var platform = require("./common/platform.js"),
network = require("./common/network.js"),
config = require("./common/config.js"),
fs = require("fs"),
path = require("path"),
log = require("./logger/logger.js")();

var componentsZipInfo = {
  "Browser": { extractTo: "", copy: "chromium" },
  "Cache": { extractTo: "RiseCache", copy: "RiseCache" },
  "Java": { extractTo: "JRE", copy: "JRE" },
  "Player": { extractTo: "", copy: "RisePlayer.jar" }
};

module.exports = {
  downloadComponents(components) {
    var promises = components.map((c)=>{
      return network.downloadFile(c.url).then((localPath)=>{
        c.localPath = localPath;
        return c;
      });
    });

    return Promise.all(promises);
  },
  extractComponents(components) {
    var promises = components.filter((c)=>{
      return c.name !== "Installer";
    }).map((c)=>{
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
    if(component.name === "Installer") {
      // Kill installer process
    }
    else {
      var source = path.join(platform.getTempDir(), componentsZipInfo[component.name].copy);
      var destination = path.join(platform.getInstallDir(), componentsZipInfo[component.name].copy);

      if(component.name == "Browser" && platform.isWindows()) {
        source = path.join(platform.getTempDir(), "chromium-win32");
      }

      return platform.moveFile(source, destination).then(()=>{
        component.destination = destination;
        return config.saveVersion(component.name, component.remoteVersion);
      })
      .then(()=>{
        return component;
      })
      .catch((err)=>{
        return Promise.reject({ message: "Error moving " + source + " to " + destination, error: err });
      });
    }
  },
  unzipFile(filePath, subdir) {
    return platform.extractZipTo(filePath, path.join(platform.getTempDir(), subdir), true)
    .catch((err)=>{
      return Promise.reject({ message: "Error unzipping " + filePath, error: err });
    });
  }
};
