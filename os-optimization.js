var platform = require("./common/platform.js"),
childProcess = require("child_process"),
linuxCommands = {
  disableScreenSaver: [
    "gsettings set org.gnome.desktop.session idle-delay 0"
  ],
  disableSleep: [
    "gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-ac-timeout 0"
  ],
  disablePowerIdle: [
    "gsettings set org.gnome.settings-daemon.plugins.power idle-dim false"
  ],
  disableSystemUpdates: [
    "sudo cp /usr/bin/update-notifier /usr/bin/update-notifier.real",
    "echo '#!/bin/sh' |sudo tee /usr/bin/update-notifier",
    "echo 'exit 0' |sudo tee -a /usr/bin/update-notifier"
  ],
  disableApport: [
    "echo ' # ' |sudo tee -a /etc/default/apport",
    "echo 'enabled=0' |sudo tee -a /etc/default/apport"
  ],
  removeRVPlayerCron: [
    "sudo sed -i.bak '/rvplayer/d' /etc/crontab"
  ]
},

windowsCommands = {
  disableScreenSaver: [
    "reg add \"HKEY_CURRENT_USER\\Control Panel\\Desktop\" /v ScreenSaveActive /t REG_SZ /d 0 /f",
    "reg add \"HKEY_CURRENT_USER\\Control Panel\\Desktop\" /v ScreenSaverIsSecure /t REG_SZ /d 0 /f",
    "reg delete \"HKEY_CURRENT_USER\\Control Panel\\Desktop\" /v SCRNSAVE.EXE /f"
  ],
  setHighPerformance: [
    "powercfg -SETACTIVE a1841308-3541-4fab-bc81-f71556f20b4a"
  ],
  setUnpluggedNeverTimeout: [
    "powercfg -change -monitor-timeout-dc 0",
    "powercfg -change -disk-timeout-dc 0",
    "powercfg -change -standby-timeout-dc 0",
    "powercfg -change -hibernate-timeout-dc 0",
  ],
  setPluggedInNeverTimeout: [
    "powercfg -change -monitor-timeout-ac 0",
    "powercfg -change -disk-timeout-dc 0",
    "powercfg -change -standby-timeout-ac 0",
    "powercfg -change -hibernate-timeout-ac 0"
  ],
  disableChromeHDPIScaling: [
    "reg add \"HKCU\\Software\\Microsoft\\Windows NT\\CurrentVersion\\AppCompatFlags\\Layers\" /v \"" + platform.getInstallerPath() + "\" /t REG_SZ /d \"~ HIGHDPIAWARE\""
  ],
  disableSecurityAlerts: [
    "reg add \"HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\" /v EnableBalloonTips /t REG_DWORD /d 0 /f"
  ],
  disableOnScreenKeyboard: [
    "reg add \"HKEY_CURRENT_USER\\Software\\Microsoft\\Windows NT\\CurrentVersion\\Accessibility\" /v Configuration /t REG_SZ /d \"\" /f"
  ]
};

function execSync(command) {
  childProcess.execSync(command, {timeout: 2000});
}

function updateSettings() {
  if(platform.isWindows()) {
    executeCommands(windowsCommands);
  }
  else {
    executeCommands(linuxCommands);
  }
}

function executeCommands(osCommands) {
  Object.keys(osCommands).forEach((key)=>{
    osCommands[key].forEach((command)=>{
      execSync(command);
    });
  });
}

module.exports = {
  linuxCommands,
  windowsCommands,
  updateSettings
};
