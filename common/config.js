var platform = require("../common/platform.js"),
path = require("path");

function getVerFilePrefix(componentName) {
  return {
    "Installer": "installer",
    "Browser": "chromium",
    "Cache": "RiseCache",
    "Java": "java",
    "Player":"RisePlayer" }[componentName];
}

function getVersionFileName(componentName) {
  return path.join(platform.getInstallDir(), getVerFilePrefix(componentName) + ".ver");
}

function getVersion(componentName) {
  return new Promise((resolve, reject)=>{
    platform.readTextFile(getVersionFileName(componentName))
    .then((localVersion)=>{
      resolve(localVersion);
    })
    .catch(()=>{
      resolve("");
    });
  });
}

module.exports = {
  getVerFilePrefix,
  getVersionFileName,
  getVersion
};
