var platform = require("./common/platform.js"),
network = require("./common/network.js"),
path = require("path");

function getJavaPath() {
  if(platform.isWindows()) {
    return platform.getInstallDir() + "\\JRE\\bin\\javaw.exe";
  }
  else {
    return platform.getInstallDir() + "/jre/bin/java";
  }
}

function startCache() {
  platform.startProcess(getJavaPath(), network.getJavaProxyArgs().concat(["-jar", path.join(platform.getInstallDir(), "RiseCache", "RiseCache.jar")]));
}

function startPlayer() {
  platform.startProcess(getJavaPath(), network.getJavaProxyArgs().concat(["-jar", path.join(platform.getInstallDir(), "RisePlayer.jar")]));
}

module.exports = {
  getJavaPath,
  startCache,
  startPlayer,
  launch() {
    return platform.killJava()
    .then(()=>{
      return platform.waitForMillis(2000);
    })
    .then(()=>{
      log.all("cache start", "", "50%");
      startCache();
      return platform.waitForMillis(1000);
    })
    .then(()=>{
      log.all("player start", "", "100%");
      startPlayer();
      return platform.waitForMillis(1000);
    });
  }
};
