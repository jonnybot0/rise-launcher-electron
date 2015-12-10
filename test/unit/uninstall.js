var platform = require("../../common/platform.js"),
uninstall = require("../../uninstall.js"),
path = require("path"),
mock = require("simple-mock").mock,
simpleMock = require("simple-mock"),
assert = require("assert");

global.log = require("../../logger/logger.js")();

describe("uninstall", ()=>{
  beforeEach("setup mocks", ()=>{
    mock(platform, "deleteRecursively").resolveWith();
    mock(platform, "renameFile").resolveWith();
  });

  afterEach("reset mocks", ()=>{
    simpleMock.restore();
  });

  it("adds uninstall option for Windows", ()=>{
    mock(platform, "isWindows").returnWith(true);
    mock(platform, "getProgramsMenuPath").returnWith("programs");
    mock(platform, "getInstallDir").returnWith("install");
    mock(platform, "writeTextFile").resolveWith();
    mock(platform, "mkdir").resolveWith();
    mock(platform, "createWindowsShortcut").resolveWith();

    return uninstall.createUninstallOption()
    .then(()=>{
      assert(platform.writeTextFile.called);
      assert(platform.mkdir.called);
      assert(platform.createWindowsShortcut.called);
      assert.equal(platform.renameFile.lastCall.args[1], path.join("programs", "Rise Vision", "Uninstall Rise Vision Player.lnk"));
    });
  });

  it("adds uninstall option for Linux", ()=>{
    mock(platform, "isWindows").returnWith(false);
    mock(platform, "getHomeDir").returnWith("home");
    mock(platform, "getInstallDir").returnWith("install");
    mock(platform, "writeTextFile").resolveWith();
    mock(platform, "mkdir").resolveWith();
    mock(platform, "createWindowsShortcut").resolveWith();

    return uninstall.createUninstallOption()
    .then(()=>{
      assert.equal(platform.writeTextFile.callCount, 2);
      assert(platform.mkdir.called);
      assert(!platform.createWindowsShortcut.called);
      assert.equal(platform.writeTextFile.lastCall.args[0], path.join("home", ".local", "share", "applications", "rvplayer-uninstall.desktop"));
    });
  });
});
