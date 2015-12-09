var network = require("./common/network.js"),
promisesPct = 0;
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
  checkSites() {
    var siteConnections = siteList.map((site)=>{
      return network.httpFetch(site, {timeout: 4000})
      .then((res)=>{
        if (res.status < 200 || res.status > 299) {
          throw new Error("not ok");
        }
        promisesPct += 9;
        log.all("Checking network connectivity - " + site, "", promisesPct + "%");
      });
    });

    return Promise.all(siteConnections);
  }
};
