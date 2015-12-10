var network = require("./common/network.js"),
platform = require("./common/platform.js"),
promisesPct = 0,
siteList = [
  "http://rvashow2.appspot.com",
  "http://rvashow.appspot.com",
  "http://storage-dot-rvaserver2.appspot.com",
  "http://store.risevision.com",
  "http://googleapis.com",
  "http://accounts.google.com",
  "http://talkgadget.google.com",
  "http://s3.amazonaws.com",
  "http://p.jwpcdn.com/6/5/jwpsrv.js"
];

module.exports = {
  checkSitesWithElectron() {
    var siteConnections = siteList.map((site)=>{
      return network.httpFetch(site, {timeout: 9000})
      .then((res)=>{
        if (res.status < 200 || res.status > 299) {
          log.external("network prereq error", res.status + " - " + site);
          throw new Error("not ok");
        }
        promisesPct += 9;
        log.all("Checking network connectivity - " + site, "", promisesPct + "%");
      })
      .catch((err)=>{
        log.external("network prereq error", err);
        throw new Error("not ok");
      });
    });

    return Promise.all(siteConnections);
  },
  checkSitesWithJava() {
    var command = `${platform.getJavaExecutablePath()} -jar java-network-test.jar ${siteList.join()}`;

    return platform.spawn(command)
    .then((retCode)=>{
      if (retCode !== 0) {throw new Error(retCode);}
      return retCode;
    });
  }
};
