var spawnSync = require("child_process").spawnSync,
path = require("path");

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
  getHomeDir() {
    return process.env[(module.exports.getOS() == "win32") ? "USERPROFILE" : "HOME"];
  },
  getUbuntuVer() {
    return spawnSync("lsb_release", ["-sr"]).stdout;
  },
  getInstallDir() {
    return path.join(module.exports.getHomeDir(), "rvplayer");
  }
};
