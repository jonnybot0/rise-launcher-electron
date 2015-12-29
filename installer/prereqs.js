var platform = requireRoot("common/platform.js"),
networkCheck = requireRoot("installer/network-check.js"),
capCheck = requireRoot("installer/cap-check.js"),
watchdogCheck = requireRoot("installer/watchdog-check.js");

module.exports = {
  validatePlatform() {
    return ["win32", "linux"].indexOf(platform.getOS()) !== -1;
  },
  validateOS() {
    var osVer;

    if (platform.getOS() === "win32") { return true; }

    osVer = platform.getUbuntuVer();

    if (!osVer) {
      return false;
    }

    if (Number(osVer) < 14.04) {
      return false;
    }
    return true;
  },
  checkNetworkConnectivity() {
    return networkCheck.checkSitesWithElectron();
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
