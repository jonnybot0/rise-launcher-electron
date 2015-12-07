var platform = require("../common/platform.js"),
path = require("path"),
ws = require("windows-shortcuts"),
userWantsAutostart = true;

module.exports = {
  requested(yesOrNo) {userWantsAutostart = yesOrNo;},
  createAutostart() {
    if (!userWantsAutostart) {
      log.debug("not setting autostart");
      return Promise.resolve();
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
    var shortCutPath = path.join(platform.getAutoStartupPath(), "Rise Vision Player.lnk");
    var uninstallPath = platform.getInstallerPath() + " --unattended";

    return platform.createWindowsShortcut(shortCutPath, uninstallPath)
    .catch((err)=>{
      log.debug("error creating autostart", err);
      log.external("error creating autostart", require("util").inspect(err));
    });
  },
  createUbuntuAutostart() {
    var autostartPath = path.join(platform.getAutoStartupPath(), "rvplayer.desktop");
    var uninstallPath = platform.getInstallerPath() + " --unattended";
    var fileText =
    `[Desktop Entry]
    Encoding=UTF-8
    Name=Rise Vision Player
    Comment=
    Icon=
    Exec=` + uninstallPath + `
    Terminal=false
    Type=Application
    Categories=
    NotShowIn=KDE;
    X-GNOME-Autostart-Delay=10
    X-Ubuntu-Gettext-Domain=rvplayer`;

    return platform.writeTextFile(autostartPath, fileText)
    .then(()=>{
      return platform.setFilePermissions(autostartPath, 0755);
    });
  }
};
