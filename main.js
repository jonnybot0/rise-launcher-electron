require("./init");

var app = require("electron").app,
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
config.setAppPath(app.getAppPath());
log.setDisplaySettings(displaySettings);
proxy.setEndpoint(displaySettings.proxy);

global.messages = requireRoot("installer/ui/messages");

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

app.makeSingleInstance(()=>{
  log.debug("Another instance was started.  Quitting.");
  app.quit();
});

app.on("ready", ()=>{
  log.debug("app ready event received");

  ipc.on("close", ()=>{
    log.setUIWindow(null);
    mainWindow.close();
  });

  ipc.on("set-proxy", (event, message)=>{
    proxy.setEndpoint(message);
    prereqCheck()
    .then(()=>{
      return installer.begin()
      .then(postInstall)
      .then(ui.enableContinue)
      .catch((err)=>{
        log.error(require("util").inspect(err), err.userFriendlyMessage || messages.unknown);
      });
    })
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
    .then(()=>{
      return installer.begin()
      .then(postInstall)
      .then(ui.enableContinue)
      .catch((err)=>{
        log.error(require("util").inspect(err), err.userFriendlyMessage || messages.unknown);
      });
    });
  });

  ipc.on("install-unattended", (event)=>{
    var countDown = 10, timer = null;

    ui.disableContinue();

    timer = setInterval(()=>{
      if(countDown === 0) {
        clearInterval(timer);
        ui.startUnattended();

        prereqCheck()
        .then(installer.begin)
        .then(postInstall)
        .then(platform.killExplorer)
        .then(launcher.launch)
        .then(()=>{
          mainWindow.close();
        })
        .catch((err)=>{
          log.setUIWindow(null);
          log.error(require("util").inspect(err), err.userFriendlyMessage || messages.unknown);
        });        
      }
      else {
        countDown--;
        event.sender.send("set-unattended-countdown", countDown);
      }
    }, 1000);
  });

  ipc.on("launch", ()=>{
    return launcher.launch().then(()=>{
      log.setUIWindow(null);
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
      ui.startUnattendedCountdown();
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
    .then(()=>{
      autostart.setUnattended(isUnattended());
      autostart.setAutostart();
    })
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
        log.error("cap found", messages.capInstalled);
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
