var network = requireRoot("common/network.js"),
platform = requireRoot("common/platform.js"),
path = require("path"),
promisesPct = 0,
siteList = [
  "http://rvashow2.appspot.com",
  "http://rvashow.appspot.com",
  "http://storage-dot-rvaserver2.appspot.com",
  "https://store.risevision.com",
  "http://googleapis.com",
  "https://accounts.google.com/ManageAccount",
  "https://talkgadget.google.com",
  "http://s3.amazonaws.com",
  "http://p.jwpcdn.com/6/5/jwpsrv.js"
];

function checkSite(site, retryCount, timeout) {
  retryCount = retryCount === undefined ? 5 : retryCount;

  return network.httpFetch(site, {timeout: timeout || 5000})
  .then((res)=>{
    if (res.status < 200 || res.status > 299) {
      log.external("network prereq error", res.status + " - " + site);
      if (retryCount === 0) { throw new Error("not ok");}
      return platform.waitForMillis(timeout || 5000)
      .then(checkSite.bind(null, site, retryCount - 1, timeout));
    }
    promisesPct += 9;
    log.all("Checking network connectivity - " + site, "", promisesPct + "%");
  })
  .catch((err)=>{
    log.external("network prereq error", err);
    if (retryCount === 0) { throw new Error("not ok");}
    return platform.waitForMillis(timeout || 5000)
    .then(checkSite.bind(null, site, retryCount - 1, timeout));
  });
}

module.exports = {
  checkSitesWithElectron(retryCount, timeout) {
    promisesPct = 0;
    var siteConnections = siteList.map((site)=>{
      return checkSite(site, retryCount, timeout);
    });

    return Promise.all(siteConnections);
  },
  checkSitesWithJava(retryCount, timeout) {
    var command = `${platform.getJavaExecutablePath()} ${network.getJavaProxyArgs().join(" ")} -jar ${path.join(platform.getInstallerDir(), "resources", "app", "java-network-test.jar")} ${siteList.join(" ")}`;

    retryCount = retryCount === undefined ? 5 : retryCount;

    if(platform.isDevMode()) return Promise.resolve();

    return platform.spawn(command)
    .then((retCode)=>{
      if (retCode !== 0) {
        if (retryCount === 0) {throw new Error(retCode);}
        return platform.waitForMillis(timeout || 5000)
        .then(module.exports.checkSitesWithJava.bind(null, retryCount - 1, timeout));
      }
      return retCode;
    });
  }
};
