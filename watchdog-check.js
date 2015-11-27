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
    else {
      var lines = output.split("\n");
      var fileName = lines[1].replace("ApplicationMonitor.exe", "Programs.xml").trim();
      var content = platform.readTextFileSync(fileName);

      return validationTokens.some((token)=>{
        return content.indexOf(token) >= 0;
      });
    }
  }
  catch (e) {
    log.debug("error checking if watchdog is running", e);
    log.external("error checking if watchdog is running", require("util").inspect(e));

    return false;
  }
}

module.exports = {
  isWatchdogRunning() {
    if(platform.isWindows()) {
      return isWindowsWatchdogRunning();
    }
    else {
      return false;
    }
  }
};
