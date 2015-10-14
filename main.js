var app = require("app"),
ipc = require("ipc"),
BrowserWindow = require("browser-window"),
installer = require("./installer.js");

app.on("window-all-closed", ()=>{
  if (process.platform != "darwin") {
    app.quit();
  }
});

app.on("ready", ()=>{
  console.log("app-ready");
  mainWindow = new BrowserWindow(
  {
    "width": 600,
    "height": 600,
    "center": true,
    "fullscreen": false,
    "skip-taskbar": true,
    "frame": false,
    "web-preferences": {
      "preload": __dirname + "/main-onload.js",
      "node-integration": false,
      "web-security": false
    }
  });
  mainWindow.loadUrl("file://" + __dirname + "/main.html");
  mainWindow.on("closed", ()=>{
    mainWindow = null;
  });

  mainWindow.webContents.on("did-finish-load", ()=> {
    mainWindow.webContents.send("first-ping");
  });
});

ipc.on("ui-pong", (event)=>{
  console.log("UI PONG!");
  installer.begin((message)=>{event.sender.send("message", message);});
});

app.on("error", (err)=>{console.dir(err);});
