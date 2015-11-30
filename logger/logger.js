module.exports = (externalLogger)=> {
  var uiWindow;

  return {
    debug(msg) {
      console.log(msg); 
    },
    error(detail, userFriendlyMessage) {
      console.log("ERROR: " + detail);
      if (externalLogger) {externalLogger.log("error", detail);}
      if (uiWindow) {uiWindow.send("errorMessage", userFriendlyMessage || detail);}
    },
    all(evt, detail) {
      console.log(evt, detail ? detail : "");
      if (uiWindow) {uiWindow.send("message", detail ? evt + ": " + detail : evt);}
      if (externalLogger) {externalLogger.log(evt, detail);}
    },
    setUIWindow(win) {
      uiWindow = win;
    },
    setDisplaySettings(settings) {
      if (externalLogger) {externalLogger.setDisplaySettings(settings);}
    },
    external(evt, detail) {
      if (externalLogger) {externalLogger.log(evt, detail);}
    },
    file() {
      Array.prototype.slice.call(arguments).forEach(msg=>{console.log(msg);});
    },
    ui(msg, id) {
      if (uiWindow) {uiWindow.send(id ? "rewriteMessage" : "message", {msg, id});}
    }
  };
};
