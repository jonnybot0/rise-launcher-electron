var ipc = require("ipc");

ipc.on("first-ping", ()=> {
  ipc.send("ui-pong");
});

ipc.on("message", (message)=> {
  dom.appendMessage(message);
});

ipc.on("rewriteMessage", (messageObject)=> {
  dom.rewriteMessage(messageObject);
});

ipc.on("errorMessage", (detail)=> {
  dom.appendError(detail);
});

ipc.on("version", (version)=> {
  dom.setVersion(version);
});

window.sendMainClose = function() {ipc.send("close");};
