var ipc = require("ipc");

ipc.on("first-ping", ()=> {
  ipc.send("ui-pong");
  var closeButton = document.querySelector("#close"),
  cancelButton = document.querySelector("#cancel"),
  addToStartup = document.querySelector("#addToStartup"),
  continueButton = document.querySelector("#continue");

  closeButton.addEventListener("click", ()=>{ipc.send("close");});
  cancelButton.addEventListener("click", ()=>{ipc.send("close");});

  addToStartup.addEventListener("click", ()=>{
    if (addToStartup.checked) {
      ipc.send("set-autostart");
    } else {
      ipc.send("unset-autostart");
    }
  });

  continueButton.addEventListener("click", ()=>{
    var slides = document.querySelectorAll(".container.slide"),
    activeSlide = document.querySelector(".container.slide.active"),
    nextIdx = Array.prototype.indexOf.call(slides, activeSlide) + 1;

    if (nextIdx !== slides.length) {
      slides[nextIdx].className = "container slide active";
      activeSlide.className = "container slide inactive";
    }

    if (slides[nextIdx] && slides[nextIdx].id === "installing") {
      ipc.send("install");
    }

    if (activeSlide.id === "launch") {
      if (document.querySelector("#startPlayer").checked) {
        ipc.send("launch");
      } else {
        ipc.send("close");
      }
    }
  });
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

ipc.on("enable-continue", (version)=> {
  var btn = document.querySelector("#continue");
  var className = btn.className;
  btn.disabled = false;

  btn.className = btn.className.split(" ")
  .filter((itm)=>{return itm !=="disabled";}).join(" ");
});

ipc.on("disable-continue", (version)=> {
  var btn = document.querySelector("#continue");
  var className = document.querySelector("#continue").className;
  className += " disabled";

  btn.disabled = true;
  btn.className = className;
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

ipc.on("set-progress", (detail)=>{
  var bar = document.querySelector(".progress-bar"),
  message = document.querySelector("#statusLabel");
  bar.style.width = detail.pct;
  message.innerHTML = detail.msg;
});
