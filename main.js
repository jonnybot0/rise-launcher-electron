require("./init");

var app = require("app"),
ipc = require("electron").ipcMain,
platform = require("rise-common-electron").platform,
player = require("rise-player-electron"),
network = require("rise-common-electron").network,
proxy = require("rise-common-electron").proxy,
config = requireRoot("installer/config.js"),
networkCheck = requireRoot("installer/network-check.js"),
launcher = requireRoot("installer/launcher.js"),
autostart = requireRoot("installer/autostart/autostart.js"),
optimization = requireRoot("installer/os-optimization.js"),
installer = requireRoot("installer/installer.js"),
prereqs = requireRoot("installer/prereqs.js"),
uninstall = requireRoot("installer/uninstall.js"),
stop = requireRoot("installer/stop-start.js"),
editConfig = requireRoot("installer/edit-config.js"),
ui = requireRoot("installer/ui/controller.js"),
displaySettings,
mainWindow;

var version = requireRoot("version.json");
var externalLogger = require("rise-common-electron").externalLogger
  (network, platform.getOS(), platform.getArch(), version);

global.log = require("rise-common-electron").logger(externalLogger, platform.getInstallDir());

displaySettings = config.getDisplaySettingsSync();
log.setDisplaySettings(displaySettings);
proxy.setEndpoint(displaySettings.proxy);

global.messages = requireRoot("installer/ui/messages.json");

log.external("started");
log.debug("Electron " + process.versions.electron);
log.debug("Chromium " + process.versions.chrome);

app.on("window-all-closed", ()=>{
  log.debug("All windows closed");
  log.external("all closed");

  if (!player.isRunning()) {
    setTimeout(()=>{app.quit();}, 500);
  }
});

app.on("error", (err)=>{log.error(err, messages.unknown);});

function isUnattended() {
  return process.argv.slice(1).some((arg)=>{
    return (arg.indexOf("unattended") > -1 || arg.toUpperCase().indexOf("/S") > -1);
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

  ipc.on("set-autostart", ()=>{
    autostart.requested(true);
    log.debug("autostart requested");
  });

  ipc.on("unset-autostart", ()=>{
    autostart.requested(false);
    log.debug("autostart not requested");
  });

  ipc.on("install", ()=>{
    ui.disableContinue();

    prereqCheck()
    .then(installer.begin)
    .then(postInstall)
    .then(ui.enableContinue);
  });

  ipc.on("install-unattended", (event, message)=>{
    ui.disableContinue();

    prereqCheck()
    .then(installer.begin)
    .then(postInstall)
    .then(launcher.launch)
    .then(()=>{
      mainWindow.close();
    });
  });

  ipc.on("launch", ()=>{
    return launcher.launch().then(()=>{
      mainWindow.close();
    });
  });

  ipc.on("ui-pong", (event)=>{
    log.debug("UI is ready");
    log.setUIWindow(event.sender);
    installer.setMainWindow(mainWindow);
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
    .catch(()=>{
      ui.showProxyOption();
      throw new Error();
    })
    .then(optimization.updateSettings)
    .then(autostart.setAutostart)
    .then(uninstall.createUninstallOption)
    .then(editConfig.createEditConfig)
    .then(stop.createStopStartLinks)
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
