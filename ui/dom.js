window.dom = {
  appendMessage(message) {
    var p = document.createElement("p");
    p.innerHTML = message;
    document.querySelector("div.messages").appendChild(p);
  },
  rewriteMessage(messageObject) {
    if (document.getElementById(messageObject.id)) {
      document.getElementById(messageObject.id).innerHTML = messageObject.msg;
    } else {
      var p = document.createElement("p");
      p.innerHTML = messageObject.msg;
      p.id = messageObject.id;
      document.querySelector("div.messages").appendChild(p);
    }
  },
  appendError(detail) {
    var p = document.createElement("p");
    p.innerHTML = detail;
    document.querySelector("div.errors").appendChild(p);
  },
  setVersion(version) {
    document.querySelector("#version").innerHTML = version;
  }
};
