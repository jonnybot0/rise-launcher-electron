var app = require("app"),
ipc = require("ipc"),
platform = require("./common/platform.js"),
network = require("./common/network.js"),
proxy = require("./common/proxy.js"),
config = require("./common/config.js"),
installer = require("./installer.js"),
prereqs = require("./prereqs.js"),
launcher = require("./launcher.js"),
ui = require("./ui/controller.js"),
displaySettings,
mainWindow;

global.log = require("./logger/logger.js")
(require("./logger/bigquery/external-logger-bigquery.js")
(require("./common/network.js"), platform));

displaySettings = config.getDisplaySettingsSync();
log.setDisplaySettings(displaySettings);
proxy.setEndpoint(displaySettings.proxy);

global.messages = require("./ui/messages.json");

log.external("started");
log.debug("Electron " + process.versions.electron);
log.debug("Chromium " + process.versions.chrome);

app.on("window-all-closed", ()=>{
  log.debug("All windows closed. quitting...");
  log.external("all closed");
  setTimeout(()=>{app.quit();}, 500);
});

app.on("error", (err)=>{log.error(err, messages.unknown);});

app.on("ready", ()=>{
  log.debug("app ready event received");

  ipc.on("close", ()=>{
    mainWindow.close();
  });

  ipc.on("set-proxy", (event, message)=>{
    proxy.setEndpoint(message);
    installerPrereqCheck();
  });

  ipc.on("ui-pong", (event)=>{
    log.debug("UI is ready");
    log.setUIWindow(event.sender);
    event.sender.send("version", require("./version"));

    if (!(prereqs.validatePlatform() && prereqs.validateOS())) {
      log.error("validation failure", messages.osRequirementsNotMet);
    }

    installerPrereqCheck();
  });

  mainWindow = ui.init();

  function installerPrereqCheck() {
    platform.onFirstRun(prereqs.checkNetworkConnectivity)()
    .catch(()=>{
      ui.showProxyOption();
      throw new Error();
    })
    .then(()=>{
      return prereqs.checkCAPNotInstalled()
      .catch(()=>{
        log.error("cap found", messages.CAPInstalled);
        throw new Error();
      });
    })
    .then(()=>{
      return prereqs.checkNoLegacyWatchdog()
      .catch(()=>{
        log.error("legacy watchdog", messages.legacyWatchdog);
        throw new Error();
      });
    })
    .then(()=>{
      installer.begin();
    });
  }
});
