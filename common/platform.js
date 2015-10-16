var spawnSync = require("child_process").spawnSync;

module.exports = {
  getCoreUrl() {
    return "https://rvaserver2.appspot.com";
  },
  getViewerUrl() {
    return "http://rvashow.appspot.com";
  },
  getOS() {
    return process.platform;
  },
  getArch() {
    return process.arch;
  },
  getInstallDir() {
    return process.env[(module.exports.getOS() == "win32") ? "USERPROFILE" : "HOME"];
  },
  getUbuntuVer() {
    ubuntuVer = spawnSync("lsb_release", ["-sr"]).stdout;
  }
};
