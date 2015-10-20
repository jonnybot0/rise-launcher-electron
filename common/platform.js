var spawnSync = require("child_process").spawnSync,
path = require("path"),
os = require("os"),
fs = require("fs-extra"),
log = require("../logger/logger.js"),
admzip = require("adm-zip");

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
  isWindows() {
    return module.exports.getOS() === "win32";
  },
  getHomeDir() {
    return process.env[module.exports.isWindows() ? "LOCALAPPDATA" : "HOME"];
  },
  getUbuntuVer() {
    return spawnSync("lsb_release", ["-sr"]).stdout;
  },
  getInstallDir() {
    return path.join(module.exports.getHomeDir(), "rvplayer");
  },
  getTempDir() {
    return os.tmpdir();
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
  },
  moveFile(source, destination) {
    return new Promise((resolve, reject)=>{
      fs.move(source, destination, { clobber: true }, (err)=>{
        if(!err) {
          resolve(destination);
        }
        else {
          reject(err);
        }
      });
    });
  },
  extractZipTo(source, destination, overwrite) {
    return new Promise((resolve, reject)=>{
      try {
        var zip = new admzip(source);
        zip.extractAllTo(destination, overwrite);
        resolve();
      }
      catch (err) {
        reject(err);
      }
    });
  }
};
