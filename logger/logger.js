var platform = require("../common/platform.js"),
fs = require("fs"),
path = require("path");

module.exports = (externalLogger)=> {
  var uiWindow;

  function padLeft(number) {
    return (String(number).length === 1 ? "0" : "") + number;
  }
  
  function getLogDatetime() {
    var d = new Date();
    
    return [ d.getFullYear(),
             padLeft(d.getMonth() + 1),
             padLeft(d.getDate())].join("/") + " " +
           [ padLeft(d.getHours()),
             padLeft(d.getMinutes()),
             padLeft(d.getSeconds())].join(":");
  }

  function appendToLog(detail, userFriendlyMessage) {
    // Do not attempt to write logs on test cases
    if(!process.versions.electron) return;

    try {
      var eventsLog = path.join(platform.getInstallDir(), "installer-events.log");
      var detailsLog = path.join(platform.getInstallDir(), "installer-detail.log");

      if(userFriendlyMessage) {
        fs.appendFileSync(eventsLog, getLogDatetime() + " - " + userFriendlyMessage + "\n");
      }

      if(detail) {
        if(userFriendlyMessage) {
          fs.appendFileSync(detailsLog, getLogDatetime() + " - " + userFriendlyMessage + "\n");
        }
        else {
          fs.appendFileSync(detailsLog, getLogDatetime() + "\n");
        }

        fs.appendFileSync(detailsLog, detail + "\n");
      }
    }
    catch (err) {
      console.log("Error writing to log file", err);
    }
  }

  return {
    debug(msg) {
      console.log(msg);
    },
    error(detail, userFriendlyMessage) {
      console.log("ERROR: " + detail);
      appendToLog(detail, userFriendlyMessage);

      if (externalLogger) {externalLogger.log("error", detail);}
      if (uiWindow) {uiWindow.send("errorMessage", userFriendlyMessage || detail);}
    },
    all(evt, detail, pct) {
      console.log(evt, detail ? detail : "");
      appendToLog(detail, evt);

      if (uiWindow && !pct) {uiWindow.send("message", detail ? evt + ": " + detail : evt);}
      if (uiWindow && pct) {uiWindow.send("set-progress", {msg: evt, pct});}
      if (externalLogger) {externalLogger.log(evt, detail);}
    },
    setUIWindow(win) {
      uiWindow = win;
    },
    setDisplaySettings(settings) {
      if (externalLogger) {externalLogger.setDisplaySettings(settings);}
    },
    external(evt, detail) {
      appendToLog(evt, detail);

      if (externalLogger) {externalLogger.log(evt, detail);}
    },
    file() {
      Array.prototype.slice.call(arguments).forEach(msg=>{console.log(msg);});
    },
    progress(msg, pct) {
      if (uiWindow) {uiWindow.send("set-progress", {msg, pct});}
    }
  };
};
