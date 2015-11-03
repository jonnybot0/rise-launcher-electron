var platform = require("../../common/platform.js"),
autostart = require("../../autostart/autostart.js"),
installer = require("../../installer.js"),
assert = require("assert"),
simpleMock = require("simple-mock"),
path = require("path"),
mock = require("simple-mock").mock;

global.log = require("../../logger/logger.js")();

describe("installer", ()=>{
  beforeEach("setup mocks", ()=>{
    mock(platform, "getTempDir").returnWith("temp");
    mock(platform, "getInstallDir").returnWith("install");
    mock(platform, "extractZipTo").resolveWith();
    mock(platform, "startProcess").resolveWith();
    mock(platform, "setFilePermissions").resolveWith();
  });

  afterEach("clean mocks", ()=>{
    simpleMock.restore();
  });

  it("starts an installer update", ()=>{
    mock(platform, "getInstallerDir").returnWith("test");
    mock(platform, "getInstallerPath").returnWith("test/test.sh");
    mock(platform, "startProcess").resolveWith();
    mock(platform, "setFilePermissions").resolveWith();

    return installer.startInstallerUpdate().then(()=>{
      assert(platform.setFilePermissions.called);
      assert(platform.startProcess.called);
      
      assert.equal(platform.startProcess.lastCall.args[0], "test/test.sh");
      assert.equal(platform.startProcess.lastCall.args[1].toString(), ["--update", "--path", "test"].toString());
    });
  });

  it("updates the Installer", ()=>{
    mock(platform, "copyFolderRecursive").resolveWith();
    mock(autostart, "createAutostart").resolveWith();

    return installer.updateInstaller("testPath", "1.2").then(()=>{
      assert(platform.copyFolderRecursive.called);
      assert.equal(platform.copyFolderRecursive.lastCall.args[0], "testPath");
      assert.equal(platform.copyFolderRecursive.lastCall.args[1], path.join("install", "Installer"));

      assert.equal(autostart.createAutostart.callCount, 1);
    });
  });
});
