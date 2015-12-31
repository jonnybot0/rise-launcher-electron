var optimization = requireRoot("installer/os-optimization.js"),
platform = require("rise-common-electron").platform,
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

  it("does nothing on linux since optimization is handled in a shell script to avoid permissions issues", ()=>{
    verifyCommands("linux");
  });

  it("logs on external call success", ()=>{
    mock(log, "debug").returnWith();
    mock(log, "all").returnWith();
    mock(log, "external").returnWith();
    mock(platform, "isWindows").returnWith(true);
    mock(childProcess, "spawn").returnWith({on(evt, fn) {if (evt === "close") {fn();}}});
    return optimization.updateSettings()
    .then(()=>{
      assert.ok(log.all.callCount > 0);
    });
  });

  it("logs on external call failures", ()=>{
    mock(log, "all").returnWith();
    mock(log, "debug").returnWith();
    mock(log, "external").returnWith();
    mock(platform, "isWindows").returnWith(true);
    mock(childProcess, "spawn").returnWith({on(evt, fn) {if (evt === "error") {fn();}}});
    return optimization.updateSettings()
    .then(()=>{
      assert.ok(false);
    })
    .catch((err)=>{
      assert.ok(log.external.callCount > 0);
    });
  });
});
