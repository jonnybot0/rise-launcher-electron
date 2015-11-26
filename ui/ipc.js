var ipc = require("ipc");

ipc.on("first-ping", ()=> {
  ipc.send("ui-pong");
  var closeButton = document.querySelector("#mainClose");
  closeButton.addEventListener("click", ()=>{ipc.send("close");});
});

ipc.on("message", (message)=> {
  var p = document.createElement("p");
  p.innerHTML = message;
  document.querySelector("div.messages").appendChild(p);
});

ipc.on("rewriteMessage", (messageObject)=> {
  if (document.getElementById(messageObject.id)) {
    document.getElementById(messageObject.id).innerHTML = messageObject.msg;
  } else {
    var p = document.createElement("p");
    p.innerHTML = messageObject.msg;
    p.id = messageObject.id;
    document.querySelector("div.messages").appendChild(p);
  }
});

ipc.on("errorMessage", (detail)=> {
  var p = document.createElement("p");
  p.innerHTML = detail;
  document.querySelector("div.errors").appendChild(p);
});

ipc.on("version", (version)=> {
  document.querySelector("#version").innerHTML = version;
});

ipc.on("show-proxy-options", ()=>{
  var optionsBlock = document.querySelector("#proxyOptions"),
  okButton = document.querySelector("#proxyOptions button");

  optionsBlock.style.display = "block";
  okButton.addEventListener("click", doneHandler);

  function doneHandler() {
    var proxyAddress = document.querySelector("#proxyAddress"),
    proxyPort = document.querySelector("#proxyPort");
    okButton.removeEventListener(doneHandler);
    optionsBlock.style.display = "none";
    ipc.send("set-proxy", proxyAddress.value + ":" + proxyPort.value );
  }
});
