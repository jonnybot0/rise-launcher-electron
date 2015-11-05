window.dom = {
  appendMessage(message) {
    var p = document.createElement("p");
    p.innerHTML = message;
    document.querySelector("div.messages").appendChild(p);
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
