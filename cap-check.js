var platform = require("./common/platform.js"),
path = require("path"),
fs = require("fs"),
risePlayerAppIds = ["ilcmohdkjfcfekfmpdppgoaaemgdmhaa", "mfpgpdablffhbfofnhlpgmokokbahooi"];

function findRisePlayerDirectory(basePath) {
  var list = fs.readdirSync(basePath);

  for(var i = 0; i < list.length; i++) {
    var file = list[i];
    var fullPath = path.join(basePath, file);
    var stat = fs.statSync(fullPath);

    if (stat && stat.isDirectory()) {
      if((risePlayerAppIds.indexOf(file) >= 0 && fullPath.indexOf("Extensions") >= 0) || findRisePlayerDirectory(fullPath)) {
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

    return findRisePlayerDirectory(basePath);
  }
};
