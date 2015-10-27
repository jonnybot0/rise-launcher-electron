var platform = require("../../common/platform.js"),
launcher = require("../../launcher.js"),
assert = require("assert"),
simpleMock = require("simple-mock"),
mock = require("simple-mock").mock;

global.log = require("../../logger/logger.js")();

describe("launcher", ()=>{
  beforeEach("setup mocks", ()=>{
    
  });

  afterEach("clean mocks", ()=>{
    simpleMock.restore();
  });

  it("properly replaces strings", ()=>{
    assert.equal(launcher.replaceAll("this_is_a_test", "_", " "), "this is a test");
  });

  it("returns the correct Java Path on Windows", ()=>{
    mock(platform, "getInstallDir").returnWith("test");
    mock(platform, "isWindows").returnWith(true);

    assert.equal(launcher.getJavaPath(), "test\\JRE\\bin\\javaw.exe");
  });

  it("returns the correct Java Path on Linux", ()=>{
    mock(platform, "getInstallDir").returnWith("test");
    mock(platform, "isWindows").returnWith(false);

    assert.equal(launcher.getJavaPath(), "test/jre/bin/java");
  });

  it("launches Cache and Player", ()=>{
    mock(platform, "getInstallDir").returnWith("test");
    mock(platform, "startProcess").returnWith();
    mock(platform, "waitFor").resolveWith();

    return launcher.launch().then(()=>{
      assert.equal(platform.startProcess.callCount, 2);
      assert.equal(platform.waitFor.callCount, 2);
    });
  });
});
