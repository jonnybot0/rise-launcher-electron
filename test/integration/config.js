var assert = require("assert"),
config = requireRoot("installer/config.js"),
app = require("electron").app;

describe("Config", ()=>{
  it("exists", ()=>{
    assert.ok(config);
  });

  it("has electron's app", ()=>{
    assert.ok(app);
  });

  it("retrieves the current running electron dir", ()=>{
    var expectedDir = "node_modules/electron-prebuilt/dist";

    config.setAppPath(app.getAppPath());
    console.log(config.getRunningInstallerDir());
    assert.ok(config.getRunningInstallerDir().indexOf(expectedDir) >= 0);
  });
});
