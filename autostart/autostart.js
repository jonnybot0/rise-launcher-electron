var platform = require("../common/platform.js"),
path = require("path");

module.exports = {
  createAutostart() {
    if(platform.isWindows()) {
      return module.exports.createWindowsAutostart();
    }
    else {
      return module.exports.createUbuntuAutostart();
    }
  },
  createWindowsAutostart() {
    var shortCutPath = path.join(platform.getAutoStartupPath(), "Rise Vision Player.lnk");

    return platform.createWindowsShortcut(shortCutPath, platform.getInstallerPath());
  },
  createUbuntuAutostart() {
    var fileText,
    autostartPath;

    autostartPath = path.join(platform.getAutoStartupPath(), "rvplayer.desktop");

    fileText =
    `[Desktop Entry]
    Encoding=UTF-8
    Name=Rise Vision Player
    Comment=
    Icon=
    Exec=` + platform.getInstallerPath() + `
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
