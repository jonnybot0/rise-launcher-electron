var platform = require("./common/platform.js"),
childProcess = require("child_process");

function execSync(command) {
  childProcess.execSync(command, { timeout: 2000 });
}

function updateSettings() {
  if(platform.isWindows()) {
    module.exports.updateWindowsSettings();
  }
  else {
    module.exports.updateLinuxSettings();
  }
}

function updateWindowsSettings() {
  module.exports.disableWindowsScreenSaver();
  module.exports.updateWindowsPowerSettings();
  module.exports.disableWindowsChromeHDPIScaling();
  module.exports.disableWindowsSecurityAlerts();
  module.exports.disableWindowsOnscreenKeyboard();
}

function disableWindowsScreenSaver() {
  execSync("reg add \"HKEY_CURRENT_USER\\Control Panel\\Desktop\" /v ScreenSaveActive /t REG_SZ /d 0 /f");
  execSync("reg add \"HKEY_CURRENT_USER\\Control Panel\\Desktop\" /v ScreenSaverIsSecure /t REG_SZ /d 0 /f");
  execSync("reg delete \"HKEY_CURRENT_USER\\Control Panel\\Desktop\" /v SCRNSAVE.EXE /f");
}

function updateWindowsPowerSettings() {
  // Set the 'Power Management' to High performance
  execSync("powercfg -SETACTIVE a1841308-3541-4fab-bc81-f71556f20b4a");

  // Set the unplugged settings to 'Never'
  execSync("powercfg -change -monitor-timeout-dc 0");
  execSync("powercfg -change -disk-timeout-dc 0");
  execSync("powercfg -change -standby-timeout-dc 0");
  execSync("powercfg -change -hibernate-timeout-dc 0");

  // Set the plugged in settings to 'Never'
  execSync("powercfg -change -monitor-timeout-ac 0");
  execSync("powercfg -change -disk-timeout-dc 0");
  execSync("powercfg -change -standby-timeout-ac 0");
  execSync("powercfg -change -hibernate-timeout-ac 0");
}

function disableWindowsChromeHDPIScaling() {
  execSync("reg add \"HKCU\\Software\\Microsoft\\Windows NT\\CurrentVersion\\AppCompatFlags\\Layers\" /v \"" + platform.getInstallerPath() + "\" /t REG_SZ /d \"~ HIGHDPIAWARE\"");
}
    
function disableWindowsSecurityAlerts() {
  execSync("reg add \"HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\" /v EnableBalloonTips /t REG_DWORD /d 0 /f");
}

function disableWindowsOnscreenKeyboard() {
  execSync("reg add \"HKEY_CURRENT_USER\\Software\\Microsoft\\Windows NT\\CurrentVersion\\Accessibility\" /v Configuration /t REG_SZ /d \"\" /f");
}

function updateLinuxSettings() {

}

module.exports = {
  execSync,
  updateSettings,
  updateWindowsSettings,
  disableWindowsScreenSaver,
  updateWindowsPowerSettings,
  disableWindowsChromeHDPIScaling,
  disableWindowsSecurityAlerts,
  disableWindowsOnscreenKeyboard,
  updateLinuxSettings
};
