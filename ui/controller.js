BrowserWindow = require("browser-window");

var mainWindow;

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

    mainWindow.loadUrl("file://" + __dirname + "/main.html");

    mainWindow.on("closed", ()=>{
      mainWindow = null;
    });

    mainWindow.webContents.on("did-finish-load", ()=> {
      log.debug("received did finish load");
      mainWindow.webContents.send("first-ping");
    });
  }
};
