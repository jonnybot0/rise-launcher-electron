var optimization = require("../../os-optimization.js"),
platform = require("../../common/platform.js"),
childProcess = require("child_process"),
assert = require("assert"),
simpleMock = require("simple-mock"),
mock = require("simple-mock").mock;

describe("os optimization", ()=>{
  beforeEach("setup mocks", ()=>{
    mock(platform, "getInstallerPath").returnWith("fake path");
    mock(childProcess, "spawn").returnWith();
  });

  afterEach("clean mocks", ()=>{
    simpleMock.restore();
  });

  function verifyCommands(windowsOrLinux) {
    var windowsCommands = optimization.windowsCommands,
    commandsToExecute = windowsOrLinux === "windows" ? windowsCommands : [],
    calledCommands;

    mock(platform, "isWindows").returnWith(windowsOrLinux === "windows");
    return optimization.updateSettings()
    .then(()=>{
      calledCommands = childProcess.spawn.calls.map((call)=>{
        return call.args[0];
      });

      Object.keys(commandsToExecute).forEach((key)=>{
        commandsToExecute[key].forEach((command)=>{
          assert(calledCommands.indexOf(command) > -1);
        });
      });
    });
  }

  it("updates Windows Settings", ()=>{
    verifyCommands("windows");
  });

  it("does nothing on linux since optimization is handled in a shell script", ()=>{
    verifyCommands("linux");
  });

  it("logs on external call failures", ()=>{
    mock(log, "debug").returnWith();
    mock(log, "external").returnWith();
    mock(platform, "isWindows").returnWith(true);
    mock(childProcess, "spawn").returnWith({on(evt, fn) {fn();}});
    optimization.updateSettings();
    assert.ok(log.debug.callCount > 0);
    assert.ok(log.external.callCount > 0);
  });
});
