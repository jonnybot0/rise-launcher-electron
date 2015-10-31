var platform = require("../common/platform.js"),
ws = require("windows-shortcuts");

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
    var shortCutPath = "%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\Rise Vision Player.lnk";

    return module.exports.createWindowsShortcut(shortCutPath, platform.getInstallerPath());
  },
  createUbuntuAutostart() {
    var homeDir = platform.getHomeDir(),
    fileText,
    autostartPath;

    autostartPath = homeDir + "/.config/autostart/rvplayer.desktop";

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
      return platform.setFilePermissions(autostartPath, 755);
    });
  },
  createWindowsShortcut(lnkPath, exePath) {
    return new Promise((resolve, reject)=>{
      ws.create(lnkPath, exePath, (err)=>{
        if(!err) {
          resolve();
        }
        else {
          reject(err);
        }
      });        
    });
  }
};
