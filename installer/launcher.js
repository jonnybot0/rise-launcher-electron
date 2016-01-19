var platform = require("rise-common-electron").platform,
player = require("rise-player-electron"),
network = require("rise-common-electron").network,
path = require("path");

function startCache() {
  platform.startProcess(platform.getJavaExecutablePath(), network.getJavaProxyArgs().concat(["-jar", path.join(platform.getInstallDir(), "RiseCache", "RiseCache.jar")]));
}

function startPlayer() {
  player.start();
}

module.exports = {
  startCache,
  startPlayer,
  launch() {
    return platform.killJava()
    .then(()=>{
      return platform.waitForMillis(2000);
    })
    .then(()=>{
      log.all("cache start", "", "50%");
      module.exports.startCache();
      return platform.waitForMillis(1000);
    })
    .then(()=>{
      log.all("player start", "", "100%");
      return module.exports.startPlayer();
    });
  }
};
