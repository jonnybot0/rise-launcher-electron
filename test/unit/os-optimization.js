var optimization = require("../../os-optimization.js"),
platform = require("../../common/platform.js"),
childProcess = require("child_process"),
assert = require("assert"),
simpleMock = require("simple-mock"),
mock = require("simple-mock").mock;

describe("launcher", ()=>{
  beforeEach("setup mocks", ()=>{
    mock(platform, "getInstallerPath").returnWith("fake path");
    mock(platform, "execSync").returnWith();
    mock(childProcess, "execSync").returnWith();
  });

  afterEach("clean mocks", ()=>{
    simpleMock.restore();
  });

  function verifyCommands(windowsOrLinux) {
    var windowsCommands = optimization.windowsCommands,
    commandsToExecute = windowsOrLinux === "windows" ? windowsCommands : [],
    calledCommands;

    mock(platform, "isWindows").returnWith(windowsOrLinux === "windows");
    optimization.updateSettings();

    calledCommands = childProcess.execSync.calls.map((call)=>{
      return call.args[0];
    });

    Object.keys(commandsToExecute).forEach((key)=>{
      commandsToExecute[key].forEach((command)=>{
        assert(calledCommands.indexOf(command) > -1);
      });
    });
  }

  it("updates Windows Settings", ()=>{
    verifyCommands("windows");
  });

  it("works on Linux by not trying to execute any commands since optimization is handled in a shell script", ()=>{
    verifyCommands("linux");
  });

  it("does not crash if execSync fails", ()=>{
    mock(log, "debug").returnWith();
    mock(platform, "isWindows").returnWith(true);
    mock(childProcess, "execSync").throwWith("failed execSync");

    optimization.windowsCommands = [ "test" ];
    optimization.updateSettings();

    assert.equal(log.debug.lastCall.args[1], "failed execSync");
  });
});
