var app = require("app"),
ipc = require("ipc"),
installer = require("./installer.js"),
prereqs = require("./prereqs.js")(require("./common/platform.js")),
ui = require("./ui/controller.js"),
messages = require("./ui/messages.json"),
mainWindow;

global.log = require("./logger/logger.js")();

app.on("window-all-closed", ()=>{
  log.debug("All windows closed. quitting...");
  app.quit();
});

app.on("error", (err)=>{log.all(err);});

app.on("ready", ()=>{
  log.debug("app ready event received");

  ipc.on("close", ()=>{
    mainWindow.close();
  });

  ipc.on("ui-pong", (event)=>{
    log.debug("UI PONG!");
    log.setUIWindow(event.sender);
    event.sender.send("version", require("./version"));

    if (!(prereqs.validatePlatform() && prereqs.validateOS())) {
      log.all(messages.osRequirementsNotMet);
    }

    installer.begin();
  });

  mainWindow = ui.init();
});
