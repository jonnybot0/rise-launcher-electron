var platform = require("../common/platform.js"),
network = require("../common/network.js"),
proxy = require("../common/proxy.js"),
thisInstallerVersion = require("../version.json"),
path = require("path");

function getComponents() {
  return {
    "Browser": {
      verFileName: "chromium", extractTo: "", copy: "chromium", deleteOnUpdate: true
    },
    "Cache": {
      verFileName: "RiseCache", extractTo: "RiseCache", copy: "RiseCache", deleteOnUpdate: false
    },
    "InstallerElectron": {
      verFileName: null, extractTo: "Installer", copy: "Installer", deleteOnUpdate: false
    },
    "Java": {
      verFileName: "java", extractTo: "JRE", copy: "JRE", deleteOnUpdate: true
    },
    "Player": {
      verFileName: "RisePlayer", extractTo: "", copy: "RisePlayer.jar", deleteOnUpdate: true
    }
  };
}

function getComponentInfo(componentName) {
  return getComponents()[componentName];
}

function getVerFilePrefix(componentName) {
  return getComponentInfo(componentName).verFileName;
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

function getComponentVersionSync(componentName) {
  if (componentName === "InstallerElectron") {return thisInstallerVersion;}

  return platform.readTextFileSync(getComponentVersionFileName(componentName));
}

function saveVersion(componentName, version) {
  if (componentName === "InstallerElectron") {return Promise.resolve();}

  return platform.writeTextFile(getComponentVersionFileName(componentName), version);
}

proxy.observe(saveProxySettings);
function saveProxySettings(fields) {
  if (!fields.href) {return;}
  var displaySettings = getDisplaySettingsSync(),
  displaySettingsString = "";
  log.debug("saving settings " + fields.href);

  displaySettings.proxy = fields.href;
  displaySettings.browsersetting = `--proxy-server=${fields.href}`;

  Object.keys(displaySettings).forEach((key)=>{
    displaySettingsString += `${key}=${displaySettings[key]}\n`;
  });

  platform.writeTextFile(getDisplaySettingsFileName(), displaySettingsString); 
}

function getDisplaySettingsFileName() {
  return path.join(platform.getInstallDir(), "RiseDisplayNetworkII.ini");
}

function getDisplaySettingsSync() {
  var tempDisplayId = Math.random() + "",
  textFileString = platform.readTextFileSync(getDisplaySettingsFileName());
  if (!textFileString) {textFileString = "";}
  if (textFileString.indexOf("displayid") < 0) {
    textFileString += "\ntempdisplayid=" + tempDisplayId;
  }
  return parsePropertyList(textFileString);
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
    if (line.indexOf("=") < 0) {return;}
    var vals = line.trim().split("=");
    result[vals[0]] = vals[1];
  });

  return result;
}

module.exports = {
  getVerFilePrefix,
  getComponentInfo,
  getComponentVersionFileName,
  getComponentVersion,
  getComponentVersionSync,
  saveVersion,
  getDisplaySettingsFileName,
  getDisplaySettings,
  getDisplaySettingsSync,
  parsePropertyList
};
