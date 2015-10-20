module.exports = function(platform) {
  return {
    createWindowsAutostart() {
      return platform.writeTextFile("path", "file");
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
      Exec=` + homeDir + `/rvplayer/rvplayer
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
    }
  };
};
