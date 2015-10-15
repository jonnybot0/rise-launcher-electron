var downloader = require("./downloader.js");

module.exports = {
  begin() {
    log.all("Beginning install");
    log.all("Fetching components list");
    downloader.getComponentsList().then((result)=>{
      log.all("list retrieved");
      log.all("Components list retrieved");
      var playerUrl = downloader.parseComponentsList(result).PlayerURLStable;
      log.all("Downloading file from " + playerUrl);
      log.all("Downloading file from " + playerUrl);
      return downloader.downloadFile(playerUrl);
    }).then(()=>{
      log.all("File downloaded");
      log.all("Done");
    });
  }
};
