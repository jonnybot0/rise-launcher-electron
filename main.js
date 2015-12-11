var app = require("app"),
ipc = require("electron").ipcMain,
platform = require("./common/platform.js"),
network = require("./common/network.js"),
networkCheck = require("./network-check.js"),
launcher = require("./launcher.js"),
proxy = require("./common/proxy.js"),
config = require("./common/config.js"),
autostart = require("./autostart/autostart.js"),
optimization = require("./os-optimization.js"),
installer = require("./installer.js"),
prereqs = require("./prereqs.js"),
uninstall = require("./uninstall.js"),
stop = require("./stop.js"),
editConfig = require("./edit-config.js"),
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

function isUnattended() {
  return process.argv.some((arg)=>{
    return (arg.indexOf("unattended") > -1);
  });
}

app.on("ready", ()=>{
  log.debug("app ready event received");

  ipc.on("close", ()=>{
    mainWindow.close();
  });

  ipc.on("set-proxy", (event, message)=>{
    proxy.setEndpoint(message);
    prereqCheck()
    .then(installer.begin)
    .then(postInstall)
    .then(ui.enableContinue);
  });

  ipc.on("set-autostart", (event, message)=>{
    autostart.requested(true);
    log.debug("autostart requested");
  });

  ipc.on("unset-autostart", (event, message)=>{
    autostart.requested(false);
    log.debug("autostart not requested");
  });

  ipc.on("install", (event, message)=>{
    ui.disableContinue();

    if (isUnattended()) {
      prereqCheck()
      .then(installer.begin)
      .then(postInstall)
      .then(()=>{
        return launcher.launch();
      })
      .then(()=>{
        process.exit(0);
      });
    }
    else {
      prereqCheck()
      .then(installer.begin)
      .then(postInstall)
      .then(ui.enableContinue);
    }
  });

  ipc.on("launch", ()=>{
    return launcher.launch().then(()=>{
      process.exit(0);
    });
  });

  ipc.on("ui-pong", (event)=>{
    log.debug("UI is ready");
    log.setUIWindow(event.sender);
    event.sender.send("version", require("./version"));

    if (!(prereqs.validatePlatform() && prereqs.validateOS())) {
      log.error("os validation failure", messages.osRequirementsNotMet);
    }

    if (isUnattended()) {
      ui.startUnattended();
    }
  });

  mainWindow = ui.init();

  function postInstall() {
    return networkCheck.checkSitesWithJava()
    .catch((err)=>{
      ui.showProxyOption();
      throw new Error();
    })
    .then(optimization.updateSettings)
    .then(autostart.createAutostart)
    .then(uninstall.createUninstallOption)
    .then(editConfig.createEditConfig)
    .then(stop.createStopOption)
    .then(()=>{log.all("install complete", "", "100%");});
  }

  function prereqCheck() {
    return platform.onFirstRun(()=>{
      log.all("Checking network requirements", "", "25%");
      return prereqs.checkNetworkConnectivity();
    })()
    .catch(()=>{
      ui.showProxyOption();
      throw new Error();
    })
    .then(()=>{
      log.all("Checking Chrome App Player", "", "45%");
      return prereqs.checkCAPNotInstalled()
      .catch(()=>{
        log.error("cap found", messages.CAPInstalled);
        throw new Error();
      });
    })
    .then(()=>{
      log.all("Checking Application Monitor", "", "75%");
      return prereqs.checkNoLegacyWatchdog()
      .catch(()=>{
        log.error("legacy watchdog", messages.legacyWatchdog);
        throw new Error();
      });
    });
  }
});
