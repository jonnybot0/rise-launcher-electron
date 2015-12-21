var platform = require("../common/platform.js"),
path = require("path"),
userWantsAutostart = true,
windowsShortCutPath = path.join(platform.getAutoStartupPath(), "Rise Vision Player.lnk"),
ubuntuAutostartPath = path.join(platform.getAutoStartupPath(), "rvplayer.desktop"),
oldShortCutPath = path.join(platform.getAutoStartupPath(), "Start Rise Vision Player.lnk");

module.exports = {
  requested(yesOrNo) {userWantsAutostart = yesOrNo;},
  setAutostart() {
    if (!userWantsAutostart) {
      log.debug("Removing autostart");

      if (platform.isWindows()) {
        return platform.deleteRecursively(windowsShortCutPath)
        .then(platform.deleteRecursively.bind(null, oldShortCutPath));
      } else {
        return platform.deleteRecursively(ubuntuAutostartPath);
      }
    }
    
    log.all("Setting autostart", "", "15%");

    if(platform.isWindows()) {
      return module.exports.createWindowsAutostart();
    }
    else {
      return module.exports.createUbuntuAutostart();
    }
  },
  createWindowsAutostart() {
    var shortCutPathTemp = path.join(platform.getInstallDir(), "Rise Vision Player.lnk");
    var launcherPath = platform.getInstallerPath();

    return platform.createWindowsShortcut(shortCutPathTemp, launcherPath, "--unattended")
    .then(()=>{
      return platform.deleteRecursively(windowsShortCutPath);
    })
    .then(()=>{
      return platform.renameFile(shortCutPathTemp, windowsShortCutPath);
    })
    .then(()=>{
      return platform.deleteRecursively(oldShortCutPath);
    });
  },
  createUbuntuAutostart() {
    var launcherPath = platform.getInstallerPath() + " --unattended";
    var fileText =
    `[Desktop Entry]
    Encoding=UTF-8
    Name=Rise Vision Player
    Comment=
    Icon=
    Exec=` + launcherPath + `
    Terminal=false
    Type=Application
    Categories=
    NotShowIn=KDE;
    X-GNOME-Autostart-Delay=10
    X-Ubuntu-Gettext-Domain=rvplayer`;

    return platform.writeTextFile(ubuntuAutostartPath, fileText)
    .then(()=>{
      return platform.setFilePermissions(ubuntuAutostartPath, 0755);
    });
  }
};
