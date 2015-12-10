var platform = require("./common/platform.js"),
path = require("path");

function createWindowsStopOption() {
  var riseProgramsDir = path.join(platform.getProgramsMenuPath(), "Rise Vision");
  var stopScriptPath = path.join(platform.getInstallDir(), "stop.bat");
  var stopScriptShortcutTemp = path.join(platform.getInstallDir(), "Stop Rise Vision Player.lnk");
  var stopScriptShortcut = path.join(riseProgramsDir, "Stop Rise Vision Player.lnk");
  var content = "";

  content += "taskkill /f /im chrome.exe" + "\n";
  content += "taskkill /f /im javaw.exe" + "\n";
  content += "taskkill /f /im installer.exe" + "\n";

  return platform.writeTextFile(stopScriptPath, content)
  .then(()=>{
    return platform.mkdir(riseProgramsDir);
  })
  .then(()=>{
    return platform.createWindowsShortcut(stopScriptShortcutTemp, stopScriptPath);
  })
  .then(()=>{
    return platform.deleteRecursively(stopScriptShortcut);
  })
  .then(()=>{
    return platform.renameFile(stopScriptShortcutTemp, stopScriptShortcut);
  });
}

function createLinuxStopOption() {
  var riseProgramsDir = platform.getProgramsMenuPath();
  var stopScriptPath = path.join(platform.getInstallDir(), "stop.sh");
  var stopScriptShortcut = path.join(riseProgramsDir, "rvplayer-stop.desktop");
  var content = "";

  content += "#!/bin/bash" + "\n";
  content += "pkill -f " + platform.getInstallDir() + "\n";
  content += "notify-send \"Rise Vision Player stopped\" --icon=dialog-information" + "\n";
  
  return platform.writeTextFile(stopScriptPath, content)
  .then(()=>{
    return platform.setFilePermissions(stopScriptPath, 0755);
  })
  .then(()=>{
    return platform.mkdir(riseProgramsDir);
  })
  .then(()=>{
    var shortcutContent =
    `#!/usr/bin/env xdg-open
    [Desktop Entry]
    Version=1.0
    Terminal=false
    Type=Application
    Name=Stop Rise Vision Player
    Exec=` + stopScriptPath + `
    Icon=chrome-app-list
    Categories=Application;
    StartupWMClass=chrome_app_list`;

    return platform.writeTextFile(stopScriptShortcut, shortcutContent);
  });
}

module.exports = {
  createStopOption() {
    if(platform.isWindows()) {
      return createWindowsStopOption();
    }
    else {
      return createLinuxStopOption();
    }
  }
};
