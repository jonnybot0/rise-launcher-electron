var platform = require("rise-common-electron").platform,
path = require("path"),
ws = require("windows-shortcuts");

module.exports = {
  createEditConfig() {
    if(platform.isWindows()) {
      return module.exports.createWindowsEditConfig();
    }
    else {
      return module.exports.createUbuntuEditConfig();
    }
  },
  createWindowsEditConfig() {
    var riseProgramsDir = path.join(platform.getProgramsMenuPath(), "Rise Vision");
    var shortCutPathTemp = path.join(platform.getInstallDir(), "Edit Rise Vision Player Configuration.lnk");
    var shortCutPath = path.join(riseProgramsDir, "Edit Rise Vision Player Configuration.lnk");
    var editorPath = "notepad.exe";
    var configPath = path.join(platform.getInstallDir(), "RiseDisplayNetworkII.ini");

    return platform.createWindowsShortcut(shortCutPathTemp, editorPath, configPath)
    .then(()=>{
      return platform.deleteRecursively(shortCutPath);
    })
    .then(()=>{
      return platform.renameFile(shortCutPathTemp, shortCutPath);
    });    
  },
  createUbuntuEditConfig() {
    var riseProgramsDir = platform.getProgramsMenuPath();
    var editConfigPath = path.join(riseProgramsDir, "rvplayer-config.desktop");
    var editorPath = "gedit";
    var configPath = path.join(platform.getInstallDir(), "RiseDisplayNetworkII.ini");
    var fileText =
    `[Desktop Entry]
    Encoding=UTF-8
    Name=Edit Rise Vision Player Configuration
    Comment=
    Icon=
    Exec=` + editorPath + " " + configPath + `
    Terminal=false
    Type=Application
    Categories=
    NotShowIn=KDE;
    X-GNOME-Autostart-Delay=10
    X-Ubuntu-Gettext-Domain=rvplayer`;

    return platform.writeTextFile(editConfigPath, fileText)
    .then(()=>{
      return platform.setFilePermissions(editConfigPath, 0755);
    });
  }
};
