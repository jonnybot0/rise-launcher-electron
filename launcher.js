var platform = require("./common/platform.js"),
network = require("./common/network.js"),
config = require("./common/config.js"),
url = require("url"),
proxy = require("./common/proxy.js"),
proxyArgs = [],
path = require("path");

function replaceAll(string, search, replace) {
  return string.split(search).join(replace);
}

proxy.observe(setProxyArgs);
function setProxyArgs(fields) {
  if (!fields.hostname || !fields.port) {return (proxyArgs = []);}
  proxyArgs = [
    `-Dhttp.proxyHost=${fields.hostname}`, 
    `-Dhttp.proxyPort=${fields.port}`,
    `-Dhttps.proxyHost=${fields.hostname}`,
    `-Dhttps.proxyPort=${fields.port}`
  ];
}

function getJavaPath() {
  if(platform.isWindows()) {
    return platform.getInstallDir() + "\\JRE\\bin\\javaw.exe";
  }
  else {
    return platform.getInstallDir() + "/jre/bin/java";
  }
}

function stopCache() {
  return network.httpFetch("http://localhost:9494/shutdown", { timeout: 500 })
  .catch((err)=>{
    return Promise.resolve();
  });
}

function startCache() {
  platform.startProcess(getJavaPath(), proxyArgs.concat(["-jar", path.join(platform.getInstallDir(), "RiseCache", "RiseCache.jar")]));
}

function stopPlayer() {
  return network.httpFetch("http://localhost:9449/shutdown", { timeout: 500 })
  .catch((err)=>{
    return Promise.resolve();
  });
}

function startPlayer() {
  platform.startProcess(getJavaPath(), proxyArgs.concat(["-jar", path.join(platform.getInstallDir(), "RisePlayer.jar")]));
}

module.exports = {
  replaceAll,
  getJavaPath,
  stopCache,
  startCache,
  stopPlayer,
  startPlayer,
  launch() {
    return module.exports.stopCache()
    .then(()=>{
      return platform.waitFor(2000);
    })
    .then(()=>{
      log.all("cache start");
      startCache();

      return module.exports.stopPlayer();
    })
    .then(()=>{
      return platform.waitFor(2000);
    })
    .then(()=>{
      log.all("player start");
      startPlayer();
    })
    .then(()=>{
      return platform.waitFor(2000);
    });
  }
};
