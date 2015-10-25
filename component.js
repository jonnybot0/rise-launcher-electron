var platform = require("./common/platform.js"),
network = require("./common/network.js"),
config = require("./common/config.js"),
latestChannelProb = Math.round(Math.random() * 100),
componentNames = [ "Browser", "Cache", "Java", "Player" ];

function getComponentsUrl() {
  var componentsUrl = "http://storage.googleapis.com/install-versions.risevision.com/electron-remote-components-platform-arch.cfg";

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
        versionChanged: localVersion.trim() !== remoteVersion, 
        localVersion: localVersion.trim(),
        remoteVersion: remoteVersion 
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
      log.all(err);
      reject({ message: "Error getting components list", error: err});
    });
  });
}

function getComponents() {
  return new Promise((resolve, reject)=>{
    module.exports.getComponentsList()
    .then((list)=>{
      var compsMap = config.parsePropertyList(list);
      var channel = getChannel(compsMap);

      getComponentsVersions()
      .then(buildComponentsResponse)
      .then(checkIfBrowserUpgradeable)
      .then(resolve)
      .catch((err)=>{
        reject(err);
      });

      function getComponentsVersions() {
        var promises = componentNames.map((name)=>{
          return hasVersionChanged(compsMap, name, channel);
        });

        promises.push(hasVersionChanged(compsMap, "InstallerElectron", ""));

        return Promise.all(promises);
      }

      function buildComponentsResponse(versions) {
        var components = versions.reduce((map, version)=>{
          map[version.name] = version;
          map[version.name].url = compsMap[version.name + "URL" + (version.name !== "InstallerElectron" ? channel : "")];

          return map;
        }, {});

        return Promise.resolve(components);
      }

      function checkIfBrowserUpgradeable(components) {
        return config.getDisplaySettings().then((settings)=>{
          if(settings.displayid) {
            return module.exports.isBrowserUpgradeable(settings.displayid).then((resp)=>{
              components.Browser.versionChanged = components.Browser.versionChanged && resp;
              return components;
            });
          }
          else {
            return components;
          }
        });
      }
    })
    .catch((err)=>{
      reject(err);
    });
  });
}

module.exports = {
  getLatestChannelProb() { return latestChannelProb; },
  getComponentNames() { return componentNames; },
  getComponentsUrl,
  getChannel,
  isBrowserUpgradeable,
  hasVersionChanged,
  getComponentsList,
  getComponents
};
