var downloader = require("./downloader.js");

module.exports = {
  begin(log) {
    log("Beginning install");
    log("Fetching components list");
    downloader.getComponentsList().then((result)=>{
      console.log("list retrieved");
      log("Components list retrieved");
      var playerUrl = downloader.parseComponentsList(result).PlayerURLStable;
      log("Downloading file from " + playerUrl);
      console.log("Downloading file from " + playerUrl);
      return downloader.downloadFile(playerUrl);
    }).then(()=>{
      log("File downloaded");
      log("Done");
    });
  }
};
