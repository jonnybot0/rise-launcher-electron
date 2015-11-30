var platform = require("./common/platform.js"),
childProcess = require("child_process");

var validationTokens = ["rvplayer", "ilcmohdkjfcfekfmpdppgoaaemgdmhaa", "mfpgpdablffhbfofnhlpgmokokbahooi"];

function isWindowsWatchdogRunning() {
  try {
    var command = "wmic process where \"name='ApplicationMonitor.exe'\" get ExecutablePath";
    var output = childProcess.execSync(command, {timeout: 2000}).toString();

    if(output.indexOf("No Instance(s) Available.") >= 0) {
      return false;
    }
    else if(output.indexOf("ExecutablePath") >= 0) {
      return isRisePlayerOnWindowsMonitorSettings(output.split("\n")[1].trim());
    }
    else {
      return false;
    }
  }
  catch (e) {
    log.debug("error checking if watchdog is running", e);
    log.external("error checking if watchdog is running", require("util").inspect(e));

    return false;
  }
}

function isWindowsWatchdogOnStartup() {
  try {
    var command = "reg query HKEY_CURRENT_USER\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run /v ApplicationMonitor";
    var output = childProcess.execSync(command, {timeout: 2000}).toString();

    if(output.indexOf("ERROR: The system was unable to find the specified registry key or value.") >= 0) {
      return false;
    }
    else if(output.indexOf("HKEY_CURRENT_USER") >= 0) {
      var lines = output.split("\n");
      var programPath = lines[2].substring(lines[2].indexOf("\"") + 1, lines[2].lastIndexOf("\""));
      return isRisePlayerOnWindowsMonitorSettings(programPath);
    }
    else {
      return false;
    }
  }
  catch (e) {
    log.debug("error checking if watchdog is on startup", e);
    log.external("error checking if watchdog is on startup", require("util").inspect(e));

    return false;
  }
}

function isRisePlayerOnWindowsMonitorSettings(monitorPath) {
  var fileName = monitorPath.replace("ApplicationMonitor.exe", "Programs.xml").trim();
  var content = platform.readTextFileSync(fileName);

  return validationTokens.some((token)=>{
    return content.indexOf(token) >= 0;
  });
}

module.exports = {
  isWatchdogRunning() {
    if(platform.isWindows()) {
      return isWindowsWatchdogOnStartup() || isWindowsWatchdogRunning();
    }
    else {
      return false;
    }
  }
};
