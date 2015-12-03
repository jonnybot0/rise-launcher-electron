var platform = require("./common/platform.js"),
childProcess = require("child_process"),
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
  try {
    childProcess.execSync(command, {timeout: 2000});
  }
  catch (e) {
    log.debug("error optimizing system", e);
    log.external("error optimizing system", require("util").inspect(e));
  }
}

function updateSettings() {
  if(platform.isWindows()) {
    executeCommands(windowsCommands);
  }
}

function executeCommands(osCommands) {
  var pct = 0;
  Object.keys(osCommands).forEach((key)=>{
    osCommands[key].forEach((command)=>{
      pct += 10;
      log.all("Optimizing OS settings", "", pct + "%");
      execSync(command);
    });
  });
}

module.exports = {
  windowsCommands,
  updateSettings
};
