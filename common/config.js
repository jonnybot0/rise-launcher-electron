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

function getDisplaySettingsFileName() {
  return path.join(platform.getInstallDir(), "RiseDisplayNetworkII.ini");
}

function getDisplaySettings() {
  return new Promise((resolve, reject)=>{
    platform.readTextFile(getDisplaySettingsFileName())
    .then((contents)=>{
      resolve(parsePropertyList(contents));
    })
    .catch(()=>{
      resolve({});
    });
  });
}

function parsePropertyList(list) {
  var result = {};
  list.split("\n").forEach((line)=>{
    var vals = line.trim().split("=");
    result[vals[0]] = vals[1];
  });

  return result;
}

module.exports = {
  getVerFilePrefix,
  getVersionFileName,
  getVersion,
  getDisplaySettings,
  parsePropertyList
};