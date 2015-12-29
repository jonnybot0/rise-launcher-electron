var platform = requireRoot("common/platform.js"),
stop = requireRoot("installer/stop-start.js"),
path = require("path"),
mock = require("simple-mock").mock,
simpleMock = require("simple-mock"),
assert = require("assert");

global.log = requireRoot("logger/logger.js")();

describe("stop", ()=>{
  beforeEach("setup mocks", ()=>{
    mock(platform, "deleteRecursively").resolveWith();
    mock(platform, "renameFile").resolveWith();
  });

  afterEach("reset mocks", ()=>{
    simpleMock.restore();
  });

  it("adds stop start links for Windows", ()=>{
    mock(platform, "isWindows").returnWith(true);
    mock(platform, "getProgramsMenuPath").returnWith("programs");
    mock(platform, "getInstallDir").returnWith("install");
    mock(platform, "writeTextFile").resolveWith();
    mock(platform, "mkdir").resolveWith();
    mock(platform, "createWindowsShortcut").resolveWith();

    return stop.createStopStartLinks()
    .then(()=>{
      assert(platform.writeTextFile.called);
      assert(platform.mkdir.called);
      assert(platform.createWindowsShortcut.called);
      assert.equal(platform.renameFile.calls[0].args[1], path.join("programs", "Rise Vision", "Stop Rise Vision Player.lnk"));
      assert.equal(platform.renameFile.lastCall.args[1], path.join("programs", "Rise Vision", "Restart Rise Vision Player.lnk"));
    });
  });

  it("adds stop start links for Linux", ()=>{
    mock(platform, "isWindows").returnWith(false);
    mock(platform, "getHomeDir").returnWith("home");
    mock(platform, "getInstallDir").returnWith("install");
    mock(platform, "writeTextFile").resolveWith();
    mock(platform, "mkdir").resolveWith();
    mock(platform, "createWindowsShortcut").resolveWith();

    return stop.createStopStartLinks()
    .then(()=>{
      assert.equal(platform.writeTextFile.callCount, 4);
      assert(platform.mkdir.called);
      assert(!platform.createWindowsShortcut.called);
      assert.equal(platform.writeTextFile.lastCall.args[0], path.join("home", ".local", "share", "applications", "rvplayer-restart.desktop"));
    });
  });
});
