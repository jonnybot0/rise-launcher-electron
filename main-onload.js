var ipc = require("ipc");

ipc.on("first-ping", ()=> {
  ipc.send("ui-pong");
});

ipc.on("message", (message)=> {
  console.log("message received");
  var p = document.createElement("p");
  p.innerHTML = message;
  document.querySelector("div").appendChild(p);
});
