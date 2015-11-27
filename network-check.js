var network = require("./common/network.js"),
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
      return network.httpFetch(site);
    });

    log.all("Checking network requirements", "", "25%");
    return Promise.all(siteConnections);
  }
};
