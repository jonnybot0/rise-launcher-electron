var platform = require("../../common/platform.js"),
config = require("../../common/config.js"),
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
    assert.equal(config.getVerFilePrefix("Installer"), "installer");
    assert.equal(config.getVerFilePrefix("Browser"), "chromium");
    assert.equal(config.getVerFilePrefix("Cache"), "RiseCache");
    assert.equal(config.getVerFilePrefix("Java"), "java");
    assert.equal(config.getVerFilePrefix("Player"), "RisePlayer");
  });

  it("gets the version file name of a component", ()=>{
    assert.equal(config.getVersionFileName("Player"), platform.getInstallDir() + path.sep + "RisePlayer.ver");
  });

  it("reads a version correctly", ()=>{
    mock(platform, "readTextFile").resolveWith("10.0");

    return config.getVersion("test").then((version)=>{
      assert.equal(version, "10.0");
    });
  });

  it("fails to reads a version and returns empty", ()=>{
    mock(platform, "readTextFile").rejectWith();

    return config.getVersion("test").then((version)=>{
      assert.equal(version, "");
    });
  });
});
