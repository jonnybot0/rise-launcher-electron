var platform = require("rise-common-electron").platform,
network = require("rise-common-electron").network,
config = requireRoot("installer/config.js"),
latestChannelProb = Math.random() * 100,
percentageIsMet,
componentNames = [ "Browser", "Cache", "Java", "Player" ];

function getComponentsUrl() {
  var testVersion = module.exports.getTestingVersion(),
  os = platform.isWindows() ? "win" : "lnx",
  arch = platform.getArch() === "x64" ? "64" : "32",
  componentsPath = "http://storage.googleapis.com/install-versions.risevision.com",
  componentsFile = `electron-remote-components-${os}-${arch}.json`;

  if (testVersion) {
    log.all("test version", testVersion);
  }

  return [componentsPath, testVersion, componentsFile]
  .filter((el)=>{return el;})
  .join("/");
}

function isPlayerOnLatestChannelVersion(components) {
  return config.getComponentVersionSync("Player") === components.PlayerVersionLatest;
}

function forceStableChannel() {
  var props = config.getDisplaySettingsSync();

  return props.ForceStable === "true";
}

function forceLatestChannel() {
  var props = config.getDisplaySettingsSync();

  return props.ForceLatest === "true";
}

function getTestingVersion() {
  var props = config.getDisplaySettingsSync();

  if (/^\d{4}.\d{1,2}.\d{1,2}.\d{1,2}.\d{1,2}$/.test(props.ForceTestingVersion)) {
    return props.ForceTestingVersion;
  } else {
    return undefined;
  }
}

function getChannel(components) {
  percentageIsMet = module.exports.getLatestChannelProb() < components.LatestRolloutPercent;

  if(module.exports.forceStableChannel()) {
    return "Stable";
  }
  else if(module.exports.forceLatestChannel()) {
    return "Latest";
  }
  else if(module.exports.getTestingVersion()) {
    return "Testing";
  }
  else if(components.ForceStable) {
    return "Stable";
  }
  else if(module.exports.isPlayerOnLatestChannelVersion(components) || module.exports.percentageIsMet()) {
    return "Latest";
  }
  else {
    return "Stable";
  }
}

function isBrowserUpgradeable(displayId) {
  if(!displayId) {
    return Promise.resolve(true);
  }
  else {
    return new Promise((resolve)=>{
      network.httpFetch(platform.getCoreUrl() + "/player/isBrowserUpgradeable?displayId=" + displayId)
      .then(function(resp) {
        resp.text().then((val)=>{
          resolve(val.indexOf("true") >= 0);
        });
      })
      .catch(function() {
        resolve(false);
      });
    });    
  }
}

function updateVersionStatus(compsMap, componentName, channel) {
  return new Promise((resolve)=>{
    config.getComponentVersion(componentName)
    .then((localVersion)=>{
      var remoteVersion = compsMap[componentName + "Version" + channel];
      if (!remoteVersion) {remoteVersion = compsMap[componentName + "Version" + "Stable"];}

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
      if (resp.status >= 200 && resp.status < 300) {
        resolve(resp.text());
      }
      else {
        reject({ message: "Component list request rejected with code: " + resp.status, userFriendlyMessage: messages.noNetworkConnection, error: resp });
      }
    })
    .catch(function(err) {
      reject({ message: "Error getting components list", userFriendlyMessage: messages.noNetworkConnection, error: err});
    });
  });
}

function getComponents() {
  return new Promise((resolve, reject)=>{
    module.exports.getComponentsList()
    .then((list)=>{
      var compsMap = JSON.parse(list);
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
          return updateVersionStatus(compsMap, name, channel);
        });

        promises.push(updateVersionStatus(compsMap, "InstallerElectron", ""));

        return Promise.all(promises);
      }

      function buildComponentsResponse(versions) {
        var components = versions.reduce((map, version)=>{
          var componentUrlKey = version.name + "URL" + (version.name !== "InstallerElectron" ? channel : "");
          map[version.name] = version;
          if (compsMap[componentUrlKey]) {
            map[version.name].url = compsMap[componentUrlKey];
          } else {
            map[version.name].url = compsMap[version.name + "URL" + (version.name !== "InstallerElectron" ? "Stable" : "")];
          }

          return map;
        }, {});

        return Promise.resolve(components);
      }

      function checkIfBrowserUpgradeable(components) {
        return config.getDisplaySettings().then((settings)=>{
          if(settings.displayid && components.Browser.localVersion) {
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
  percentageIsMet() { return percentageIsMet; },
  getComponentNames() { return componentNames; },
  getComponentsUrl,
  forceStableChannel,
  forceLatestChannel,
  getTestingVersion,
  isPlayerOnLatestChannelVersion,
  getChannel,
  isBrowserUpgradeable,
  updateVersionStatus,
  getComponentsList,
  getComponents
};
