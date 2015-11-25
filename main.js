var app = require("app"),
ipc = require("ipc"),
installer = require("./installer.js"),
prereqs = require("./prereqs.js")(require("./common/platform.js")),
ui = require("./ui/controller.js"),
mainWindow;

global.log = require("./logger/logger.js")
(require("./logger/bigquery/external-logger-bigquery.js")
(require("./common/network.js"), require("./common/platform.js")));

log.setDisplaySettings
(require("./common/config.js").getDisplaySettingsSync());

global.messages = require("./ui/messages.json");

log.external("started");
log.debug("Electron " + process.versions.electron);
log.debug("Chromium " + process.versions.chrome);

app.on("window-all-closed", ()=>{
  log.debug("All windows closed. quitting...");
  log.external("all closed");
  setTimeout(()=>{app.quit();}, 500);
});

app.on("error", (err)=>{log.error(err);});

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
      log.error(messages.osRequirementsNotMet);
    }

    installer.begin();
  });

  mainWindow = ui.init();
});
