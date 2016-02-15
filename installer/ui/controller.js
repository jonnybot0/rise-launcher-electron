var BrowserWindow = require("browser-window"),
platform = require("rise-common-electron").platform,
shell = require("electron").shell,
mainWindow;

module.exports = {
  init() {
    mainWindow = new BrowserWindow(
    {
      "width": 600,
      "height": 600,
      "center": true,
      "fullscreen": false,
      "skip-taskbar": true,
      "frame": false,
      "web-preferences": {
        "preload": __dirname + "/ipc.js",
        "node-integration": false,
        "web-security": false
      }
    });

    mainWindow.loadURL("file://" + __dirname + "/main.html");

    mainWindow.on("closed", ()=>{
      mainWindow = null;
    });

    mainWindow.webContents.on("did-finish-load", ()=> {
      mainWindow.webContents.send("first-ping");
    });

    mainWindow.webContents.on("new-window", (evt, url)=>{
      evt.preventDefault();
      shell.openExternal(url);
    });

    return mainWindow;
  },
  showProxyOption() {
    mainWindow.webContents.send("show-proxy-options");
  },
  setProgress(details) {
    mainWindow.webContents.send("set-progress", details);
  },
  enableContinue() {
    mainWindow.webContents.send("enable-continue");
  },
  disableContinue() {
    mainWindow.webContents.send("disable-continue");
  },
  startUnattended() {
    mainWindow.webContents.send("start-unattended");
  },
  startUnattendedCountdown() {
    var details = { isWindows: platform.isWindows(), version: platform.getWindowsVersion() };

    mainWindow.webContents.send("start-unattended-countdown", details);
  }
};
