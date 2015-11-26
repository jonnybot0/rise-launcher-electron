var platform = require("./common/platform.js"),
path = require("path"),
fs = require("fs"),
risePlayerAppId = "ilcmohdkjfcfekfmpdppgoaaemgdmhaa";

function findDirectory(basePath, name) {
  var list = fs.readdirSync(basePath);

  for(var i = 0; i < list.length; i++) {
    var file = list[i];
    var fullPath = path.join(basePath, file);
    var stat = fs.statSync(fullPath);

    if (stat && stat.isDirectory()) {
      if((file === name && fullPath.indexOf("Extensions") >= 0) || findDirectory(fullPath, name)) {
        return true;
      }
    }
  }

  return false;
}

module.exports = {
  isCAPInstalled() {
    var basePath;

    if(platform.isWindows()) {
      basePath = path.join(platform.getHomeDir(), "Google", "Chrome", "User Data");
    }
    else {
      basePath = path.join(platform.getHomeDir(), ".config", "google-chrome");
    }

    return findDirectory(basePath, risePlayerAppId);
  }
};
