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
      log.error("Linux version not supported");
      return false;
    }

    if (!Number(osVer.toString()) || Number(osVer.toString()) < 14.04) {
      log.all("Ubuntu 14.04 or later is required.");
      return false;
    }
    return true;
  },
  checkNetworkConnectivity() {
    return networkCheck.checkSites();
  }
};
