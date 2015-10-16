var spawnSync = require("child_process").spawnSync,
path = require("path"),
fs = require("fs");

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
    return process.env[(module.exports.getOS() == "win32") ? "LOCALAPPDATA" : "HOME"];
  },
  getUbuntuVer() {
    return spawnSync("lsb_release", ["-sr"]).stdout;
  },
  getInstallDir() {
    return path.join(module.exports.getHomeDir(), "rvplayer");
  },
  readTextFile(path) {
    return new Promise((resolve, reject)=>{
      fs.readFile(path, "utf8", function (err, data) {
        if(!err) {
          resolve(data);
        }
        else {
          reject({ message: "Error reading file", error: err });
        }
      });
    });
  },
  writeTextFile(path, data) {
    return new Promise((resolve, reject)=>{
      fs.writeFile(path, data, "utf8", function (err) {
        if(!err) {
          resolve();
        }
        else {
          reject({ message: "Error writing file", error: err });
        }
      });
    });
  }
};
