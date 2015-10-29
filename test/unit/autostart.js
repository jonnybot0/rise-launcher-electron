var assert = require("assert"),
mock = require("simple-mock"),
autostart;

describe("autostart", ()=>{
  it("exists", ()=>{
    autostart = require("../../autostart/autostart.js");
    assert.ok(autostart);
  });
  it("saves windows file", ()=>{
    var writeFileStub = mock.stub().resolveWith(true);
    var homeDirStub = mock.stub().returnWith("/home/testuser");
    var autostart = require("../../autostart/autostart.js")({
      writeTextFile: writeFileStub,
      getHomeDir: homeDirStub
    });

    autostart.createWindowsAutostart()
    .then(()=>{
      assert.ok(stub.callCount = 1);
    });
  });
  it("saves ubuntu file", ()=>{
    var writeFileStub = mock.stub().resolveWith(true);
    var readFileStub = mock.stub().resolveWith("fake\nautostart\nfile");
    var setFilePermissionsStub = mock.stub().resolveWith(true);
    var homeDirStub = mock.stub().returnWith("/home/testuser");
    var autostart = require("../../autostart/autostart.js")({
      readTextFile: readFileStub,
      writeTextFile: writeFileStub,
      setFilePermissions: setFilePermissionsStub,
      getHomeDir: homeDirStub
    });

    var expectedAutoStartPath = "/home/testuser/.config/autostart/rvplayer.desktop";

    return autostart.createUbuntuAutostart()
    .then(()=>{
      assert.ok(writeFileStub.callCount === 1);
      assert.ok(setFilePermissionsStub.callCount === 1);
      assert.ok(setFilePermissionsStub.lastCall.args[0] === expectedAutoStartPath);
    });
  });
});
