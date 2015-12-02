var platform = require("./common/platform.js"),
path = require("path");

function createWindowsUninstallOption() {
  var riseProgramsDir = path.join(platform.getProgramsMenuPath(), "Rise Vision");
  var uninstallerPath = path.join(platform.getInstallDir(), "uninstall.bat");
  var content = "";

  content += "taskkill /f /im chrome.exe" + "\n";
  content += "taskkill /f /im java.exe" + "\n";
  content += "taskkill /f /im installer.exe" + "\n";
  content += "choice /C Y /N /D Y /T 3 & del /F /S /Q " + platform.getInstallDir() + "\n";

  return platform.writeTextFile(uninstallerPath, content)
  .then(()=>{
    return platform.mkdir(riseProgramsDir);
  })
  .then(()=>{
    return platform.createWindowsShortcut(path.join(riseProgramsDir, "Rise Vision Player.lnk"), uninstallerPath);
  });
}

function createLinuxUninstallOption() {
  var riseProgramsDir = platform.getProgramsMenuPath();
  var uninstallerPath = path.join(platform.getInstallDir(), "uninstall.sh");
  var content = "";

  content += "#!/bin/bash" + "\n";
  content += "killall chrome" + "\n";
  content += "killall java" + "\n";
  content += "killall installer" + "\n";
  content += "sleep 3" + "\n";
  content += "rm -rf " + platform.getInstallDir() + "\n";

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

    return platform.writeTextFile(path.join(riseProgramsDir, "rvplayer-uninstall.desktop"), shortcutContent);
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
