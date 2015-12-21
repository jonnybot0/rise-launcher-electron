var autostart = require("../../autostart/autostart.js"),
platform = require("../../common/platform.js"),
path = require("path"),
assert = require("assert"),
simpleMock = require("simple-mock"),
mock = require("simple-mock").mock,
autostart;

describe("autostart", ()=>{
  afterEach("clean mocks", ()=>{
    simpleMock.restore();
  });

  it("exists", ()=>{
    assert.ok(autostart);
  });

  it("creates the correct autostart file (Windows)", ()=>{
    mock(autostart, "createWindowsAutostart").resolveWith();
    mock(autostart, "createUbuntuAutostart").resolveWith();
    mock(platform, "isWindows").returnWith(true);

    return autostart.createAutostart()
    .then(()=>{
      assert.ok(autostart.createWindowsAutostart.callCount === 1);
      assert.ok(autostart.createUbuntuAutostart.callCount === 0);
    });
  });

  it("creates the correct autostart file (Linux)", ()=>{
    mock(autostart, "createWindowsAutostart").resolveWith();
    mock(autostart, "createUbuntuAutostart").resolveWith();
    mock(platform, "isWindows").returnWith(false);

    return autostart.createAutostart()
    .then(()=>{
      assert.ok(autostart.createWindowsAutostart.callCount === 0);
      assert.ok(autostart.createUbuntuAutostart.callCount === 1);
    });
  });

  it("creates Windows autostart file", ()=>{
    var exePath = path.join("C:", "Users", "rvuser", "AppData", "Local", "rvplayer2", "Installer", "installer.exe");

    mock(platform, "getInstallerPath").returnWith(exePath);
    mock(platform, "createWindowsShortcut").resolveWith();
    mock(platform, "renameFile").resolveWith();
    mock(platform, "deleteRecursively").resolveWith();

    return autostart.createWindowsAutostart()
    .then(()=>{
      assert.equal(platform.createWindowsShortcut.callCount, 1);
      assert.equal(platform.createWindowsShortcut.lastCall.args[1], exePath);
      assert.equal(platform.deleteRecursively.callCount, 2);
    });
  });

  it("creates Ubuntu autostart file", ()=>{
    var expectedAutoStartPath = path.join("home", "testuser", ".config", "autostart", "rvplayer.desktop");

    mock(platform, "isWindows").returnWith(false);
    mock(platform, "writeTextFile").resolveWith(true);
    mock(platform, "readTextFile").resolveWith("fake\nautostart\nfile");
    mock(platform, "setFilePermissions").resolveWith(true);
    mock(platform, "getHomeDir").returnWith(path.join("home", "testuser"));
    mock(platform, "getInstallerPath").returnWith(path.join("home", "testuser", "rvplayer2", "Installer", "installer"));

    return autostart.createUbuntuAutostart()
    .then(()=>{
      assert.ok(platform.writeTextFile.callCount === 1);
      assert.ok(platform.setFilePermissions.callCount === 1);
      assert.ok(platform.getInstallerPath.callCount === 1);
      assert.equal(platform.setFilePermissions.lastCall.args[0], expectedAutoStartPath);
    });
  });

  it("does not create a autostart entry", ()=>{
    mock(autostart, "createWindowsAutostart").resolveWith();
    mock(autostart, "createUbuntuAutostart").resolveWith();

    autostart.requested(false);
    
    return autostart.createAutostart().then(()=>{
      assert(!autostart.createWindowsAutostart.called);
      assert(!autostart.createUbuntuAutostart.called);
    });
  });
});
