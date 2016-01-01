var platform = require("rise-common-electron").platform,
network = require("rise-common-electron").network,
config = requireRoot("installer/config.js"),
latestChannelProb = Math.round(Math.random() * 100),
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

function getTestingVersion() {
  var props = config.getDisplaySettingsSync();

  if (props.ForceTestingVersion && /\d\d\d\d.\d\d.\d\d.\d\d.\d\d/.test(props.ForceTestingVersion)) {
    return props.ForceTestingVersion;
  } else {
    return undefined;
  }
}

function getChannel(components) {
  if(module.exports.getTestingVersion()) {
    return "Testing";
  }
  else if(components.ForceStable) {
    return "Stable";
  }
  else if(module.exports.isPlayerOnLatestChannelVersion(components) || module.exports.getLatestChannelProb() < components.LatestRolloutPercent) {
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
        resolve(resp.text().indexOf("true") >= 0);
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
        reject({ message: "Component list request rejected with code: " + resp.status, error: resp });
      }
    })
    .catch(function(err) {
      log.error(err, messages.unknown);
      reject({ message: "Error getting components list", error: err});
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
          map[version.name] = version;
          map[version.name].url = compsMap[version.name + "URL" + (version.name !== "InstallerElectron" ? channel : "")];

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
  getComponentNames() { return componentNames; },
  getComponentsUrl,
  getTestingVersion,
  isPlayerOnLatestChannelVersion,
  getChannel,
  isBrowserUpgradeable,
  updateVersionStatus,
  getComponentsList,
  getComponents
};
