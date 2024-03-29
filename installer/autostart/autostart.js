var platform = require("rise-common-electron").platform,
path = require("path"),
userWantsAutostart = true,
unattended = false;

module.exports = {
  requested(yesOrNo) {userWantsAutostart = yesOrNo;},
  setUnattended(yesOrNo) {unattended = yesOrNo;},
  setAutostart() {
    var ubuntuAutostartPath = path.join(platform.getAutoStartupPath(), "rvplayer.desktop");
    var windowsShortCutPath = path.join(platform.getAutoStartupPath(), "Rise Vision Player.lnk");
    var oldShortCutPath = path.join(platform.getAutoStartupPath(), "Start Rise Vision Player.lnk");

    if (unattended) {
      return Promise.resolve();
    }

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
    var windowsShortCutPath = path.join(platform.getAutoStartupPath(), "Rise Vision Player.lnk");
    var oldShortCutPath = path.join(platform.getAutoStartupPath(), "Start Rise Vision Player.lnk");
    var shortCutPathTemp = path.join(platform.getInstallDir(), "Rise Vision Player.lnk");
    var launcherPath = platform.getInstallerPath();

    return platform.mkdirRecursively(platform.getAutoStartupPath())
    .then(()=>{
      return platform.createWindowsShortcut(shortCutPathTemp, launcherPath, "--unattended");
    })
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
    var ubuntuAutostartPath = path.join(platform.getAutoStartupPath(), "rvplayer.desktop");
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

    return platform.mkdirRecursively(platform.getAutoStartupPath())
    .then(()=>{
      return platform.writeTextFile(ubuntuAutostartPath, fileText);
    })
    .then(()=>{
      return platform.setFilePermissions(ubuntuAutostartPath, 0755);
    });
  }
};
