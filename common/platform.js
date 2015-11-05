var childProcess = require("child_process"),
path = require("path"),
os = require("os"),
fs = require(process.versions.electron ? "original-fs" : "fs"),
ncp = require("ncp"),
gunzip = require("gunzip-maybe"),
tar = require("tar-fs");

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
    return childProcess.spawnSync("lsb_release", ["-sr"]).stdout;
  },
  getInstallDir() {
    return path.join(module.exports.getHomeDir(), "rvplayer2");
  },
  getTempDir() {
    return os.tmpdir();
  },
  getInstallerName() {
    return module.exports.isWindows() ? "installer.exe" : "installer";
  },
  getInstallerDir() {
    return path.join(module.exports.getInstallDir(), "Installer");
  },
  getInstallerPath() {
    return path.join(module.exports.getInstallerDir(), module.exports.getInstallerName());
  },
  waitFor(milliseconds) {
    return new Promise((resolve, reject)=>{
      setTimeout(function() {
        resolve();
      }, milliseconds);
    });
  },
  startProcess(command, args) {
    childProcess.spawn(command, args, {
      cwd: path.dirname(command),
      stdio: "ignore",
      detached: true
    }).unref();
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
  readTextFileSync(path) {
    var stringContents = "";

    try {
      stringContents = fs.readFileSync(path, "utf8");
    } catch (e) {
      log.error("Could not read display settings file");
    }

    return stringContents;
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
  copyFolderRecursive(source, target) {
    return new Promise((resolve, reject)=>{
      ncp(source, target, { clobber: true }, (err)=>{
        if(!err) {
          resolve();
        }
        else {
          reject(err);
        }
      });
    });
  },
  extractZipTo(source, destination, overwrite) {
    return new Promise((resolve, reject)=>{
      fs.createReadStream(source)
      .pipe(gunzip())
      .pipe(tar.extract(destination, {fs: fs}))
      .on("finish", resolve)
      .on("error", (err)=>{
        reject(err);
      });
    });
  },
  setFilePermissions(path, mode) {
    return new Promise((resolve, reject)=>{
      fs.chmod(path, mode, (err)=>{
        if (err) {
          reject({ message: "Error setting file permissions", error: err });
        }
        else {
          resolve();
        }
      });
    });
  },
  fileExists(path) {
    try {
      fs.lstatSync(path);
      return true;
    }
    catch(e) {
      return false;
    }
  },
  mkdir(path) {
    return new Promise((resolve, reject)=>{
      try {
        fs.mkdirSync(path);
        resolve();
      } catch(e) {
        if (e.code !== "EEXIST") {
          reject({ message: "Error creating directory", error: e });
        }
        else {
          resolve();
        }
      }
    });
  },
  renameFile(oldName, newName) {
    return new Promise((resolve, reject)=>{
      fs.rename(oldName, newName, (err)=>{
        if(!err) {
          resolve();
        }
        else {
          reject({ message: "Error renaming file", error: err });
        }
      });
    });
  },
};
