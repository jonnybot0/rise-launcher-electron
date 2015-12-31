var editConfig = requireRoot("installer/edit-config.js"),
platform = require("rise-common-electron").platform,
path = require("path"),
assert = require("assert"),
simpleMock = require("simple-mock"),
mock = require("simple-mock").mock;

describe("edit config", ()=>{
  beforeEach("setup mocks", ()=>{
    mock(platform, "deleteRecursively").resolveWith();
    mock(platform, "renameFile").resolveWith();
  });

  afterEach("clean mocks", ()=>{
    simpleMock.restore();
  });

  it("creates the correct edit config shortcut (Windows)", ()=>{
    mock(editConfig, "createWindowsEditConfig").resolveWith();
    mock(editConfig, "createUbuntuEditConfig").resolveWith();
    mock(platform, "isWindows").returnWith(true);

    return editConfig.createEditConfig()
    .then(()=>{
      assert(editConfig.createWindowsEditConfig.callCount === 1);
      assert(editConfig.createUbuntuEditConfig.callCount === 0);
    });
  });

  it("creates the correct edit config shortcut (Linux)", ()=>{
    mock(editConfig, "createWindowsEditConfig").resolveWith();
    mock(editConfig, "createUbuntuEditConfig").resolveWith();
    mock(platform, "isWindows").returnWith(false);

    return editConfig.createEditConfig()
    .then(()=>{
      assert(editConfig.createWindowsEditConfig.callCount === 0);
      assert(editConfig.createUbuntuEditConfig.callCount === 1);
    });
  });

  it("creates Windows edit config shortcut", ()=>{
    var installDir = path.join("C:", "Users", "rvuser", "AppData", "Local", "rvplayer");

    mock(platform, "getInstallDir").returnWith(installDir);
    mock(platform, "createWindowsShortcut").resolveWith();

    return editConfig.createWindowsEditConfig()
    .then(()=>{
      assert.equal(platform.createWindowsShortcut.callCount, 1);
      assert.equal(platform.createWindowsShortcut.lastCall.args[2], path.join(installDir, "RiseDisplayNetworkII.ini"));
    });
  });

  it("creates Ubuntu edit config shortcut", ()=>{
    mock(platform, "isWindows").returnWith(false);
    mock(platform, "writeTextFile").resolveWith(true);
    mock(platform, "setFilePermissions").resolveWith(true);
    mock(platform, "getHomeDir").returnWith("home");
    mock(platform, "getInstallDir").returnWith(path.join("home", "testuser", "rvplayer"));

    return editConfig.createUbuntuEditConfig()
    .then(()=>{
      assert(platform.writeTextFile.callCount === 1);
      assert(platform.setFilePermissions.callCount === 1);
      assert(platform.getInstallDir.callCount === 1);
      assert.equal(platform.writeTextFile.lastCall.args[0], path.join("home", ".local", "share", "applications", "rvplayer-config.desktop"));
    });
  });
});
