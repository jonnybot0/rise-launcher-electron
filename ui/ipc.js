var ipc = require("ipc");

ipc.on("first-ping", ()=> {
  ipc.send("ui-pong");
});

ipc.on("message", (message)=> {
  dom.appendMessage(message);
});
