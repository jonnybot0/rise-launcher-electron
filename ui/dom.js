window.dom = {
  appendMessage(message) {
    var p = document.createElement("p");
    p.innerHTML = message;
    document.querySelector("div").appendChild(p);
  },
  setVersion(version) {
    document.querySelector("#version").innerHTML = version;
  }
};
