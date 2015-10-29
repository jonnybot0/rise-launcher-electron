var platform = require("./common/platform.js"),
network = require("./common/network.js"),
path = require("path");

function replaceAll(string, search, replace) {
  return string.split(search).join(replace);
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
  platform.startProcess(getJavaPath(), ["-jar", path.join(platform.getInstallDir(), "RiseCache", "RiseCache.jar")]);
}

function stopPlayer() {
  return network.httpFetch("http://localhost:9449/shutdown", { timeout: 500 })
  .catch((err)=>{
    return Promise.resolve();
  });
}

function startPlayer() {
  platform.startProcess(getJavaPath(), ["-jar", path.join(platform.getInstallDir(), "RisePlayer.jar")]);
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
      log.all("Starting cache");
      startCache();
      log.all("Cache started");

      return module.exports.stopPlayer();
    })
    .then(()=>{
      return platform.waitFor(2000);
    })
    .then(()=>{
      log.all("Starting Player");
      startPlayer();
      log.all("Player started");
    });
  }
};
