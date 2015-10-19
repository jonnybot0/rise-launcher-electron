module.exports = (externalLogger)=> {
  var uiWindow;

  return {
    debug(msg) {
      console.log(msg); 
    },
    all(msg) {
      console.log(msg);
      if (uiWindow) {uiWindow.send("message", msg);}
      if (externalLogger) {externalLogger.sendEvent(msg);}
    },
    setUIWindow(win) {
      uiWindow = win;
    },
    file(...msgs) {
      msgs.forEach(msg=>{console.log(msg);});
    }
  };
};
