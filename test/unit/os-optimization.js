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

  function verifyAllCommandsWereCalled(windowsOrLinux) {
    var windowsCommands = optimization.windowsCommands,
    linuxCommands = optimization.linuxCommands,
    useWindows = windowsOrLinux === "windows",
    commandsToExecute = useWindows ? windowsCommands : linuxCommands,
    calledCommands;

    mock(platform, "isWindows").returnWith(useWindows);
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
    verifyAllCommandsWereCalled("windows");
  });

  it("updates Linux Settings", ()=>{
    verifyAllCommandsWereCalled("linux");
  });
});
