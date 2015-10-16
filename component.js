var platform = require("./common/platform.js"),
network = require("./common/network.js"),
config = require("./common/config.js"),
latestChannelProb = Math.round(Math.random() * 100),
componentNames = [ "Browser", "Cache", "Java", "Player" ];

function getComponentsUrl() {
  var componentsUrl = "http://storage.googleapis.com/install-versions.risevision.com/remote-components-platform-arch.cfg";

  if (platform.getOS() === "linux") {
    componentsUrl = componentsUrl.replace("platform", "lnx");
    componentsUrl = componentsUrl.replace("arch", platform.getArch() === "x64" ? "64" : "32");
  } else {
    componentsUrl = componentsUrl.replace("platform", "win");
    componentsUrl = componentsUrl.replace("-arch", "");
  }

  return componentsUrl;
}

function getChannel(components) {
  if(components.ForceStable === "true" || module.exports.getLatestChannelProb() > Number(components.LatestRolloutPercent)) {
    return "Stable";
  }
  else {
    return "Latest";
  }
}

function isBrowserUpgradeable(displayId) {
  if(!displayId) {
    return Promise.resolve(true);
  }
  else {
    return new Promise((resolve, reject)=>{
      network.httpFetch(platform.getCoreUrl() + "/player/isBrowserUpgradeable?displayId=" + displayId)
      .then(function(resp) {
        resolve(resp.text().indexOf("true") >= 0);
      })
      .catch(function(err) {
        resolve(false);
      });
    });    
  }
}

function hasVersionChanged(compsMap, componentName, channel) {
  return new Promise((resolve, reject)=>{
    config.getVersion(componentName)
    .then((localVersion)=>{
      var remoteVersion = compsMap[componentName + "Version" + channel];

      resolve({
        name: componentName,
        changed: localVersion.trim() !== remoteVersion, 
        local: localVersion.trim(),
        remote: remoteVersion 
      });
    });
  });
}

function getComponentsList() {
  return new Promise((resolve, reject)=>{
    network.httpFetch(getComponentsUrl())
    .then(function(resp) {
      resolve(resp.text());
    })
    .catch(function(err) {
      log.debug(err);
      reject(err);
    });
  });
}

function getComponents() {
  return new Promise((resolve, reject)=>{
    module.exports.getComponentsList()
    .then((list)=>{
      var compsMap = config.parsePropertyList(list);
      var channel = getChannel(compsMap);
      var components = {};
      var promises = [];

      // Check if versions have changed and get component url
      componentNames.forEach((name)=>{
        promises.push(hasVersionChanged(compsMap, name, channel));
      });

      promises.push(hasVersionChanged(compsMap, "Installer", ""));

      Promise.all(promises).then((resps)=>{
        resps.forEach((resp)=>{
          components[resp.name] = {};

          components[resp.name].versionChanged = resp.changed;
          components[resp.name].localVersion = resp.local;
          components[resp.name].remoteVersion = resp.remote;

          if(resp.name === "Installer") {
            components[resp.name].url = compsMap.InstallerURL;
          }
          else {
            components[resp.name].url = compsMap[resp.name + "URL" + channel];
          }
        });

        // Check if browser is upgradeable
        config.getDisplaySettings().then((settings)=>{
          if(settings.displayid) {
            module.exports.isBrowserUpgradeable(settings.displayid).then((resp)=>{
              components.Browser.versionChanged = components.Browser.versionChanged && resp;
              resolve(components);
            });
          }
          else {
            resolve(components);
          }
        });
      })
      .catch((err)=>{
        reject(err);
      });
    })
    .catch((err)=>{
      reject(err);
    });
  });
}

module.exports = {
  getLatestChannelProb() {
    return latestChannelProb;
  },
  getComponentsUrl,
  getChannel,
  isBrowserUpgradeable,
  hasVersionChanged,
  getComponentsList,
  getComponents
};
