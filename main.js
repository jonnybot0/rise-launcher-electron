var app = require("app"),
ipc = require("ipc"),
installer = require("./installer.js"),
prereqs = require("./prereqs.js"),
ui = require("./ui/controller.js");

global.log = require("./logger.js")();

app.on("window-all-closed", ()=>{
    app.quit();
});

app.on("error", (err)=>{log.all(err);});

app.on("ready", ()=>{
  log.debug("app ready event received");

  ipc.on("ui-pong", (event)=>{
    log.debug("UI PONG!");
    log.setUIWindow(event.sender);

    if (!(prereqs.validatePlatform() && prereqs.validateOS())) {
      log.all("Requirements are not met.  Attmpting to use previous installation.");
    }

    installer.begin();
  });

  ui.init();
});
