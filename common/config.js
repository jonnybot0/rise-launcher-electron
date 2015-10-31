var platform = require("../common/platform.js"),
thisInstallerVersion = require("../version.json"),
path = require("path");

function getVerFilePrefix(componentName) {
  return {
    "Browser": "chromium",
    "Cache": "RiseCache",
    "Java": "java",
    "Player":"RisePlayer" }[componentName];
}

function getComponentVersionFileName(componentName) {
  return path.join(platform.getInstallDir(), getVerFilePrefix(componentName) + ".ver");
}

function getComponentVersion(componentName) {
  return new Promise((resolve, reject)=>{
    if (componentName === "InstallerElectron") {return resolve(thisInstallerVersion);}

    platform.readTextFile(getComponentVersionFileName(componentName))
    .then((localVersion)=>{
      resolve(localVersion);
    })
    .catch(()=>{
      resolve("");
    });
  });
}

function saveVersion(componentName, version) {
  return platform.writeTextFile(getComponentVersionFileName(componentName), version);
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
  getComponentVersionFileName,
  getComponentVersion,
  saveVersion,
  getDisplaySettings,
  parsePropertyList
};
