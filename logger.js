module.exports = ()=> {
  var uiWindow;

  return {
    debug(msg) {
      console.log(msg); 
    },
    all(msg) {
      console.log(msg);
      if (uiWindow) {uiWindow.send("message", msg);}
    },
    setUIWindow(win) {
      uiWindow = win;
    }
  };
};
