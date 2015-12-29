var platform = requireRoot("common/platform.js"),
path = require("path");

function createWindowsLinks() {
  var riseProgramsDir = path.join(platform.getProgramsMenuPath(), "Rise Vision");
  var stopScriptShortcutTemp = path.join(platform.getInstallDir(), "Stop Rise Vision Player.lnk");
  var startScriptShortcutTemp = path.join(platform.getInstallDir(), "Restart Rise Vision Player.lnk");
  var startScriptPath = path.join(platform.getInstallDir(), "start.bat");
  var stopScriptPath = path.join(platform.getInstallDir(), "stop.bat");
  var stopScriptShortcut = path.join(riseProgramsDir, "Stop Rise Vision Player.lnk");
  var startScriptShortcut = path.join(riseProgramsDir, "Restart Rise Vision Player.lnk");
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
  })
  .then(()=>{
    content += platform.getInstallerPath() + "\n";
    return platform.writeTextFile(startScriptPath, content);
  })
  .then(()=>{
    return platform.createWindowsShortcut(startScriptShortcutTemp, startScriptPath);
  })
  .then(()=>{
    return platform.deleteRecursively(startScriptShortcut);
  })
  .then(()=>{
    return platform.renameFile(startScriptShortcutTemp, startScriptShortcut);
  });
}

function createLinuxScript(isRestart) {
  var action = isRestart ? "Restarting" : "Stopping";
  var content = "#!/bin/bash" + "\n";

  content += "notify-send \"" + action + " Rise Vision Player\" --icon=dialog-information" + "\n";
  content += "pkill -f " + platform.getInstallDir() + "/chrome\n";
  content += "sleep 1" + "\n";
  content += "pkill -f " + platform.getInstallDir() + "/Rise\n";
  content += "sleep 1" + "\n";
  content += "pkill -f " + platform.getInstallDir() + "/Installer\n";
  content += "sleep 1" + "\n";

  return content;
}

function createLinuxLinks() {
  var riseProgramsDir = platform.getProgramsMenuPath();
  var stopScriptPath = path.join(platform.getInstallDir(), "stop.sh");
  var startScriptPath = path.join(platform.getInstallDir(), "start.sh");
  var stopScriptShortcut = path.join(riseProgramsDir, "rvplayer-stop.desktop");
  var startScriptShortcut = path.join(riseProgramsDir, "rvplayer-restart.desktop");
  var content = createLinuxScript(false);

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
  })
  .then(()=>{
    content = createLinuxScript(true);
    content += platform.getInstallerPath() + "\n";
    return platform.writeTextFile(startScriptPath, content);
  })
  .then(()=>{
    return platform.setFilePermissions(startScriptPath, 0755);
  })
  .then(()=>{
    var shortcutContent =
    `#!/usr/bin/env xdg-open
    [Desktop Entry]
    Version=1.0
    Terminal=false
    Type=Application
    Name=Restart Rise Vision Player
    Exec=` + startScriptPath + `
    Icon=chrome-app-list
    Categories=Application;
    StartupWMClass=chrome_app_list`;

    return platform.writeTextFile(startScriptShortcut, shortcutContent);
  });
}

module.exports = {
  createStopStartLinks() {
    if(platform.isWindows()) {
      return createWindowsLinks();
    }
    else {
      return createLinuxLinks();
    }
  }
};
