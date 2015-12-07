var platform = require("./common/platform.js"),
childProcess = require("child_process"),
promisesPct = 0,
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

function spawn(command) {
  var args = command.split(" ");
  args.splice(0, 1);
  log.debug("executing " + command.split(" ")[0] + " with [" + args + "]");

  return new Promise((res, rej)=>{
    var child;

      child = childProcess.spawn(command.split(" ")[0], args, {timeout: 2000});
      child.on("close", (retCode)=>{
        promisesPct += (100 / 15); // Currently 15 commands
        log.all("Optimizing OS Settings", "", promisesPct + "%");
        res(retCode);
      });
      child.on("error", (err)=>{
        log.debug("error optimizing system", err);
        log.external("error optimizing system", require("util").inspect(err));
        res(retCode);
      });
  });
}

function updateSettings() {
  if(!platform.isWindows()) {return Promise.resolve();}
  return executeCommands(windowsCommands);
}

function executeCommands(osCommands) {
  promises = [];

  Object.keys(osCommands).forEach((key)=>{
    osCommands[key].forEach((command)=>{
      promises.push(spawn(command));
    });
  });

  return Promise.all(promises);
}

module.exports = {
  windowsCommands,
  updateSettings
};
