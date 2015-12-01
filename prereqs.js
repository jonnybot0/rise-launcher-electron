var platform = require("./common/platform.js"),
networkCheck = require("./network-check.js"),
capCheck = require("./cap-check.js"),
watchdogCheck = require("./watchdog-check.js");

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
  },
  checkCAPNotInstalled() {
    if (!capCheck.isCAPInstalled()) {return Promise.resolve();}
    return Promise.reject();
  },
  checkNoLegacyWatchdog() {
    if (!watchdogCheck.hasLegacyWatchdog()) {return Promise.resolve();}
    return Promise.reject();
  }
};
