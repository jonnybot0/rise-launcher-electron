var network = require("./common/network.js"),
promisesPct = 0;
siteList = [
  "http://rvashow2.appspot.com",
  "http://rvashow.appspot.com",
  "http://rvaserver2.appspot.com",
  "http://storage-dot-rvaserver2.appspot.com",
  "http://store.risevision.com",
  "http://commondatastorage.googleapis.com",
  "http://googleapis.com",
  "http://accounts.google.com",
  "http://talkgadget.google.com",
  "http://s3.amazonaws.com",
  "http://p.jwpcdn.com/6/5/jwpsrv.js"
];

module.exports = {
  checkSites() {
    var siteConnections = siteList.map((site)=>{
      return network.httpFetch(site)
      .then(()=>{
        promisesPct += 10;
        log.all("Checking network connectivity - " + site, "", promisesPct + "%");
      });
    });

    return Promise.all(siteConnections);
  }
};
