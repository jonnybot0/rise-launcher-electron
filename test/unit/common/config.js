var platform = require("../../../common/platform.js"),
config = require("../../../common/config.js"),
path = require("path"),
assert = require("assert"),
simpleMock = require("simple-mock"),
mock = require("simple-mock").mock;

describe("config", ()=>{
  beforeEach("setup mocks", ()=>{
    
  });

  afterEach("clean mocks", ()=>{
    simpleMock.restore();
  });

  it("gets the file name prefix of a component", ()=>{
    assert.equal(config.getVerFilePrefix("Browser"), "chromium");
    assert.equal(config.getVerFilePrefix("Cache"), "RiseCache");
    assert.equal(config.getVerFilePrefix("Java"), "java");
    assert.equal(config.getVerFilePrefix("Player"), "RisePlayer");
  });

  it("gets the version file name of a component", ()=>{
    assert.equal(config.getComponentVersionFileName("Player"), platform.getInstallDir() + path.sep + "RisePlayer.ver");
  });

  it("reads a version correctly", ()=>{
    mock(platform, "readTextFile").resolveWith("10.0");

    return config.getComponentVersion("test").then((version)=>{
      assert.equal(version, "10.0");
    });
  });

  it("fails to read a version and returns empty", ()=>{
    mock(platform, "readTextFile").rejectWith();

    return config.getComponentVersion("test").then((version)=>{
      assert.equal(version, "");
    });
  });

  it("writes a version correctly", ()=>{
    mock(platform, "writeTextFile").resolveWith();

    return config.saveVersion("test", "10").then(()=>{
      assert(platform.writeTextFile.called);
    });
  });

  it("fails to write a version correctly", ()=>{
    mock(platform, "writeTextFile").rejectWith();

    return config.saveVersion("test", "10").catch(()=>{
      assert(platform.writeTextFile.called);
    });
  });
});
