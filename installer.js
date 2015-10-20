var component = require("./component.js"),
downloader = require("./downloader.js");

module.exports = {
  begin() {
    log.all("Beginning install");
    log.all("Fetching components list");

    component.getComponents().then((compsMap)=>{
      var components = component.getComponentNames().map((name)=>{ return compsMap[name]; });
      var changedComponents = components.filter((c)=>{ return c.versionChanged; });
      var changedNames = changedComponents.map((c)=>{ return c.name; });

      log.all("Downloading components " + changedNames);

      downloader.downloadComponents(changedComponents)
      .then(()=>{
        log.all("Extracting components" + changedNames);

        return downloader.extractComponents(changedComponents);
      })
      .then(()=>{
        log.all("Installing components" + changedNames);

        return downloader.installComponents(changedComponents);
      })
      .then(()=>{
        log.all("Installation finished");
      })
      .catch((err)=>{
        log.all(err);
      });
    });
  }
};
