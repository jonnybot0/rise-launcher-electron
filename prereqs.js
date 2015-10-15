var spawnSync = require("child_process").spawnSync;

module.exports = {
  validatePlatform() {
    return ["win32", "linux"].indexOf(process.platform) !== -1;
  },
  validateOS() {
    var osVer;

    if (process.platform === "win32") {return true;}

    osVer = spawnSync("lsb_release", ["-sr"]).stdout;

    if (!osVer) {
      log.all("Could not determine os release.");
      return false;
    }

    if (osVer.toString() != "14.04") {
      log.all("Ubuntu 14.04 is required.");
      return false;
    }
  }
};
