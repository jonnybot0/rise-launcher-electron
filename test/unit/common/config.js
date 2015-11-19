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

  it("gets the information of a component", ()=>{
    assert.equal(config.getComponentInfo("Player").copy, "RisePlayer.jar");
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

    return config.getComponentVersion("Browser").then((version)=>{
      assert.equal(version, "10.0");
      assert(platform.readTextFile.called);
    });
  });

  it("does not read a file for Installer's version", ()=>{
    mock(platform, "readTextFile").resolveWith();

    return config.getComponentVersion("InstallerElectron").then((version)=>{
      assert(!platform.readTextFile.called);
    });
  });

  it("reads a version correctly synchronously", ()=>{
    mock(platform, "readTextFileSync").returnWith("10.0");

    assert(config.getComponentVersionSync("Browser"), "10.0");
    assert(platform.readTextFileSync.called);
  });

  it("does not read a file for Installer's version synchronously", ()=>{
    mock(platform, "readTextFileSync").returnWith();

    assert(config.getComponentVersionSync("InstallerElectron"));
    assert(!platform.readTextFileSync.called);
  });

  it("fails to read a version and returns empty", ()=>{
    mock(platform, "readTextFile").rejectWith();

    return config.getComponentVersion("Browser").then((version)=>{
      assert.equal(version, "");
    });
  });

  it("writes a version correctly", ()=>{
    mock(platform, "writeTextFile").resolveWith();

    return config.saveVersion("Browser", "10").then(()=>{
      assert(platform.writeTextFile.called);
    });
  });

  it("does not write a file for Installer's version", ()=>{
    mock(platform, "writeTextFile").resolveWith();

    return config.saveVersion("InstallerElectron", "10").then(()=>{
      assert(!platform.writeTextFile.called);
    });
  });

  it("fails to write a version correctly", ()=>{
    mock(platform, "writeTextFile").rejectWith();

    return config.saveVersion("Browser", "10").catch(()=>{
      assert(platform.writeTextFile.called);
    });
  });

  it("returns the correct settings file name", ()=>{
    mock(platform, "getInstallDir").returnWith("test");

    assert.equal(config.getDisplaySettingsFileName(), path.join("test", "RiseDisplayNetworkII.ini"));
  });

  it("returns display settings", ()=>{
    mock(platform, "readTextFile").resolveWith("option1=value1");

    return config.getDisplaySettings().then((settings)=>{
      assert(platform.readTextFile.called);
      assert.equal(settings.option1, "value1");
    });
  });

  it("returns empty display settings on load failure", ()=>{
    mock(platform, "readTextFile").rejectWith();

    return config.getDisplaySettings().then((settings)=>{
      assert(platform.readTextFile.called);
      assert.equal(settings.toString(), {}.toString());
    });
  });

  it("synchronously returns display settings", ()=>{
    mock(platform, "readTextFileSync").returnWith("option1=value1");

    var settings = config.getDisplaySettingsSync();

    assert(platform.readTextFileSync.called);
    assert.equal(settings.option1, "value1");
  });

  it("synchronously returns temporary display id if real id doesn't exist", ()=>{
    mock(platform, "readTextFileSync").returnWith("");

    var settings = config.getDisplaySettingsSync();

    assert(platform.readTextFileSync.called);
    assert.equal(settings.displayid, undefined);
    assert.equal(settings.tempdisplayid.substring(0, 2), "0.");
  });

  it("synchronously only returns real display id if it exists", ()=>{
    mock(platform, "readTextFileSync").returnWith("displayid=A2F9");

    var settings = config.getDisplaySettingsSync();

    assert(platform.readTextFileSync.called);
    assert.equal(settings.displayid, "A2F9");
    assert.equal(settings.tempdisplayid, undefined);
  });

  it("synchronously returns empty display settings on load failure", ()=>{
    mock(platform, "readTextFileSync").returnWith("");

    var settings = config.getDisplaySettingsSync();

    assert(platform.readTextFileSync.called);
    assert.equal(settings.toString(), {}.toString());
  });

  it("correctly parses an empty list", ()=>{
    var map = config.parsePropertyList("");

    assert.equal(map.toString(), {}.toString());
  });

  it("correctly parses a list", ()=>{
    var map = config.parsePropertyList("option1=value1\noption2=value2");

    assert.equal(map.option1, "value1");
    assert.equal(map.option2, "value2");
  });
});
