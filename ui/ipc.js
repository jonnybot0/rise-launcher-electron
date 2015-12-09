const ipc = require("electron").ipcRenderer;

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

ipc.on("message", (evt, message)=> {
  var p = document.createElement("p");
  p.innerHTML = message;
  document.querySelector("div.messages").appendChild(p);
});

ipc.on("start-unattended", (evt, message)=> {
  var currentSlide = document.querySelector(".container.slide.active"),
  installingSlide = document.querySelector("#installing");

  currentSlide.className = "container slide inactive";
  installingSlide.className = "container slide active";

  ipc.send("install");
});

ipc.on("rewriteMessage", (evt, messageObject)=> {
  if (document.getElementById(messageObject.id)) {
    document.getElementById(messageObject.id).innerHTML = messageObject.msg;
  } else {
    var p = document.createElement("p");
    p.innerHTML = messageObject.msg;
    p.id = messageObject.id;
    document.querySelector("div.messages").appendChild(p);
  }
});

ipc.on("errorMessage", (evt, detail)=> {
  document.querySelector(".errors").style.display = "inline-block";
  var p = document.createElement("p");
  p.innerHTML = detail;
  document.querySelector("div.errors").appendChild(p);
  setContinueButtonEnabled(false);
  var currentSlide = document.querySelector(".container.slide.active");
  currentSlide.className = "container slide inactive";
});

ipc.on("version", (evt, version)=> {
  document.querySelector("#version").innerHTML = version;
});

ipc.on("enable-continue", ()=> {
  setContinueButtonEnabled(true);
});

ipc.on("disable-continue", ()=> {
  setContinueButtonEnabled(false);
});

function setContinueButtonEnabled(enabled) {
  var btn = document.querySelector("#continue");
  var className = btn.className;
  btn.disabled = !enabled;

  if (!enabled) {
    className += " disabled";
    btn.className = className;
  } else {
    btn.className = btn.className.split(" ")
    .filter((itm)=>{return itm !=="disabled";}).join(" ");
  }
}

ipc.on("show-proxy-options", ()=>{
  var optionsBlock = document.querySelector("#proxyOptions"),
  okButton = document.querySelector("#proxyOptions button"),
  progressContainer = document.querySelector("#progressContainer");

  optionsBlock.style.display = "block";
  progressContainer.style.display = "none";

  okButton.addEventListener("click", doneHandler);

  function doneHandler() {
    var proxyAddress = document.querySelector("#proxyAddress"),
    proxyPort = document.querySelector("#proxyPort");
    okButton.removeEventListener(doneHandler);
    optionsBlock.style.display = "none";
    progressContainer.style.display = "block";
    ipc.send("set-proxy", proxyAddress.value + ":" + proxyPort.value );
  }
});

ipc.on("set-progress", (evt, detail)=>{
  var bar = document.querySelector(".progress-bar"),
  message = document.querySelector("#statusLabel");
  bar.style.width = detail.pct;
  message.innerHTML = detail.msg;
});
