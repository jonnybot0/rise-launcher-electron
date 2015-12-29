var platform = requireRoot("common/platform.js"),
path = require("path");

function createWindowsUninstallOption() {
  var riseProgramsDir = path.join(platform.getProgramsMenuPath(), "Rise Vision");
  var uninstallerPath = path.join(platform.getInstallDir(), "uninstall.bat");
  var autostartShortcut = path.join(platform.getAutoStartupPath(), "Rise Vision Player.lnk");
  var uninstallShortcutTemp = path.join(platform.getInstallDir(), "Uninstall Rise Vision Player.lnk");
  var uninstallShortcut = path.join(riseProgramsDir, "Uninstall Rise Vision Player.lnk");
  var content = "";

  content += "taskkill /f /im chrome.exe" + "\n";
  content += "taskkill /f /im javaw.exe" + "\n";
  content += "taskkill /f /im installer.exe" + "\n";
  content += "del /F /Q \"" + autostartShortcut + "\"\n";
  content += "rd /S /Q \"" + riseProgramsDir + "\"\n";
  content += "choice /C Y /N /D Y /T 3 & rd /S /Q \"" + platform.getInstallDir() + "\"\n";

  return platform.writeTextFile(uninstallerPath, content)
  .then(()=>{
    return platform.mkdir(riseProgramsDir);
  })
  .then(()=>{
    return platform.createWindowsShortcut(uninstallShortcutTemp, uninstallerPath);
  })
  .then(()=>{
    return platform.deleteRecursively(uninstallShortcut);
  })
  .then(()=>{
    return platform.renameFile(uninstallShortcutTemp, uninstallShortcut);
  });    
}

function createLinuxUninstallOption() {
  var riseProgramsDir = platform.getProgramsMenuPath();
  var uninstallerPath = path.join(platform.getInstallDir(), "uninstall.sh");
  var autostartShortcut = path.join(platform.getAutoStartupPath(), "rvplayer.desktop");
  var uninstallShortcut = path.join(riseProgramsDir, "rvplayer-uninstall.desktop");
  var stopShortcut = path.join(riseProgramsDir, "rvplayer-stop.desktop");
  var configShortcut = path.join(riseProgramsDir, "rvplayer-config.desktop");
  var content = "";

  content += "#!/bin/bash" + "\n";
  content += "pkill -f " + platform.getInstallDir() + "/chrome\n";
  content += "sleep 1" + "\n";
  content += "pkill -f " + platform.getInstallDir() + "/Rise\n";
  content += "sleep 1" + "\n";
  content += "pkill -f " + platform.getInstallDir() + "/Installer\n";
  content += "sleep 1" + "\n";
  content += "rm -f " + autostartShortcut + "\n";
  content += "rm -f " + uninstallShortcut + "\n";
  content += "rm -f " + configShortcut + "\n";
  content += "rm -f " + stopShortcut + "\n";
  content += "rm -rf " + platform.getInstallDir() + "\n";
  content += "rm -rf $HOME/.config/rvplayer\n";
  content += "notify-send \"Rise Vision Player uninstalled\" --icon=dialog-information" + "\n";

  return platform.writeTextFile(uninstallerPath, content)
  .then(()=>{
    return platform.setFilePermissions(uninstallerPath, 0755);
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
    Name=Uninstall Rise Vision Player
    Exec=` + uninstallerPath + `
    Icon=chrome-app-list
    Categories=Application;
    StartupWMClass=chrome_app_list`;

    return platform.writeTextFile(uninstallShortcut, shortcutContent);
  });
}

module.exports = {
  createUninstallOption() {
    if(platform.isWindows()) {
      return createWindowsUninstallOption();
    }
    else {
      return createLinuxUninstallOption();
    }
  }
};
