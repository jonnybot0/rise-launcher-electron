var app = require("app"),
ipc = require("ipc"),
installer = require("./installer.js"),
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
    installer.begin();
  });

  ui.init();
});
