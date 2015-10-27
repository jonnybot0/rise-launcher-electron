var platform = require("./common/platform"),
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

function startCache() {
  platform.startProcess(getJavaPath(), ["-jar", path.join(platform.getInstallDir(), "RiseCache", "RiseCache.jar")]);
}

function startPlayer() {
  platform.startProcess(getJavaPath(), ["-jar", path.join(platform.getInstallDir(), "RisePlayer.jar")]);
}

module.exports = {
  replaceAll,
  getJavaPath,
  startCache,
  startPlayer,
  launch() {
    return platform.waitFor(2000)
    .then(()=>{
      log.all("Starting cache");
      startCache();

      return platform.waitFor(2000);
    })
    .then(()=>{
      log.all("Starting Player");
      startPlayer();
    });
  }
};
