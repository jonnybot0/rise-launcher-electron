var platform = require("../../common/platform.js"),
network = require("../../common/network.js"),
proxy = require("../../common/proxy.js"),
launcher = require("../../launcher.js"),
assert = require("assert"),
simpleMock = require("simple-mock"),
mock = require("simple-mock").mock;

global.log = require("../../logger/logger.js")();

describe("launcher", ()=>{
  beforeEach("setup mocks", ()=>{
    mock(platform, "writeTextFile").resolveWith();
  });

  afterEach("clean mocks", ()=>{
    simpleMock.restore();
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

  it("sets proxy arguments for cache", ()=>{
    var expectedJavaParameters = [
      "-Dhttp.proxyHost=127.0.0.1",
      "-Dhttp.proxyPort=8888",
      "-Dhttps.proxyHost=127.0.0.1",
      "-Dhttps.proxyPort=8888",
    ];
    mock(platform, "startProcess").returnWith();
    proxy.setEndpoint({address: "127.0.0.1", port: "8888"});
    launcher.startCache();
    assert.equal(platform.startProcess.calls[0].args[1][0], expectedJavaParameters[0]);
    assert.equal(platform.startProcess.calls[0].args[1][1], expectedJavaParameters[1]);
    assert.equal(platform.startProcess.calls[0].args[1][2], expectedJavaParameters[2]);
    assert.equal(platform.startProcess.calls[0].args[1][3], expectedJavaParameters[3]);
  });

  it("doesn't set invalid proxy", ()=>{
    var expectedArgCountWithoutProxySettings = 2,
    javaArgCountCalled;

    mock(platform, "startProcess").returnWith();
    proxy.setEndpoint("badproxy");
    launcher.startCache();
    console.log(platform.startProcess.calls[0]);
    javaArgCountCalled = platform.startProcess.calls[0].args[1].length;
    assert.equal(javaArgCountCalled, expectedArgCountWithoutProxySettings);
  });

  it("sets valid proxy arguments for player", ()=>{
    var expectedJavaParameters = [
      "-Dhttp.proxyHost=127.0.0.1",
      "-Dhttp.proxyPort=8888",
      "-Dhttps.proxyHost=127.0.0.1",
      "-Dhttps.proxyPort=8888",
    ];
    mock(platform, "startProcess").returnWith();
    proxy.setEndpoint({address: "127.0.0.1", port: "8888"});
    launcher.startPlayer();
    assert.equal(platform.startProcess.calls[0].args[1][0], expectedJavaParameters[0]);
    assert.equal(platform.startProcess.calls[0].args[1][1], expectedJavaParameters[1]);
    assert.equal(platform.startProcess.calls[0].args[1][2], expectedJavaParameters[2]);
    assert.equal(platform.startProcess.calls[0].args[1][3], expectedJavaParameters[3]);
  });

  it("launches Cache and Player", ()=>{
    mock(platform, "getInstallDir").returnWith("test");
    mock(platform, "startProcess").returnWith();
    mock(platform, "waitForMillis").resolveWith();
    mock(platform, "killJava").resolveWith();
    mock(network, "httpFetch").resolveWith();

    return launcher.launch().then(()=>{
      assert.equal(platform.startProcess.callCount, 2);
      assert.equal(platform.waitForMillis.callCount, 3);
    });
  });

  it("launches Cache and Player even when stopping them fails", ()=>{
    mock(platform, "getInstallDir").returnWith("test");
    mock(platform, "startProcess").returnWith();
    mock(platform, "waitForMillis").resolveWith();
    mock(platform, "killJava").resolveWith();
    mock(network, "httpFetch").rejectWith();

    return launcher.launch().then(()=>{
      assert.equal(platform.startProcess.callCount, 2);
      assert.equal(platform.waitForMillis.callCount, 3);
    });
  });
});
