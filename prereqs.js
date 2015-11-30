var platform = require("./common/platform.js"),
networkCheck = require("./network-check.js");

module.exports = {
  validatePlatform() {
    return ["win32", "linux"].indexOf(platform.getOS()) !== -1;
  },
  validateOS() {
    var osVer;

    if (platform.getOS() === "win32") {return true;}

    osVer = platform.getUbuntuVer();

    if (!osVer) {
      return false;
    }

    if (osVer.toString().trim() !== "14.04") {
      return false;
    }
    return true;
  },
  checkNetworkConnectivity() {
    return networkCheck.checkSites();
  }
};
