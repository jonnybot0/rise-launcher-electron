var platform = require("./common/platform.js"),
network = require("./common/network.js"),
latestChannelProb = Math.round(Math.random() * 100);

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
        log.debug(err);
        resolve(false);
      });
    });    
  }
}

module.exports = {
  getLatestChannelProb() {
    return latestChannelProb;
  },
  getComponentsUrl,
  getChannel,
  isBrowserUpgradeable,
  getComponentsList() {
    return new Promise((resolve, reject)=>{
      network.httpFetch(url)
      .then(function(resp) {
        resolve(resp.text());
      })
      .catch(function(err) {
        log.debug(err);
        reject(err);
      });
    });
  },
  parseComponentsList(list) {
    var result = {};
    list.split(require("os").EOL).forEach((line)=>{
      var vals = line.split("=");
      result[vals[0]] = vals[1];
    });

    return result;
  }
};
