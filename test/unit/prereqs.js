var prereqs = requireRoot("installer/prereqs.js"),
platform = require("rise-common-electron").platform,
networkCheck = requireRoot("installer/network-check.js"),
capCheck = requireRoot("installer/cap-check.js"),
watchdogCheck = requireRoot("installer/watchdog-check.js"),
mock = require("simple-mock").mock,
simpleMock = require("simple-mock"),
assert = require("assert");

global.log = require("rise-common-electron").logger();

describe("prereqs", ()=>{
  afterEach("reset mocks", ()=>{
    simpleMock.restore();
  });

  it("allows Windows", ()=>{
    mock(platform, "getOS").returnWith("win32");
    assert.ok(prereqs.validatePlatform());
  });

  it("fails when not windows or linux", ()=>{
    mock(platform, "getOS").returnWith("darwin");
    assert.ok(prereqs.validatePlatform() === false);
  });

  it("accepts windows", ()=>{
    mock(platform, "getOS").returnWith("win32");
    assert.ok(prereqs.validateOS());
  });

  it("accepts ubuntu 14.04", ()=>{
    mock(platform, "getOS").returnWith("linux");
    mock(platform, "getUbuntuVer").returnWith("14.04");
    assert.ok(prereqs.validateOS());
  });

  it("fails when not running ubuntu", ()=>{
    mock(platform, "getOS").returnWith("linux");
    mock(platform, "getUbuntuVer").returnWith(null);
    assert.ok(!prereqs.validateOS());
  });

  it("fails when ubuntu is previous than 14.04", ()=>{
    mock(platform, "getOS").returnWith("linux");
    mock(platform, "getUbuntuVer").returnWith("13.10");
    assert.ok(!prereqs.validateOS());
  });

  it("accepts ubuntu greater than 14.04", ()=>{
    mock(platform, "getOS").returnWith("linux");
    mock(platform, "getUbuntuVer").returnWith("15.10");
    assert.ok(prereqs.validateOS());
  });

  it("checks network connectivity", ()=>{
    mock(networkCheck, "checkSites").resolveWith(true);
    prereqs.checkNetworkConnectivity().then(()=>{assert.ok(true);});
  });

  it("checks CAP is not installed and resolves", ()=>{
    mock(capCheck, "isCAPInstalled").returnWith(false);

    return prereqs.checkCAPNotInstalled()
    .then(()=>{
      assert(capCheck.isCAPInstalled.called);
    });
  });

  it("checks CAP is installed and rejects", ()=>{
    mock(capCheck, "isCAPInstalled").returnWith(true);

    return prereqs.checkCAPNotInstalled()
    .catch(()=>{
      assert(capCheck.isCAPInstalled.called);
    });
  });

  it("checks watchdog is not installed and resolves", ()=>{
    mock(watchdogCheck, "hasLegacyWatchdog").returnWith(false);

    return prereqs.checkNoLegacyWatchdog()
    .then(()=>{
      assert(watchdogCheck.hasLegacyWatchdog.called);
    });
  });

  it("checks watchdog is installed and rejects", ()=>{
    mock(watchdogCheck, "hasLegacyWatchdog").returnWith(true);

    return prereqs.checkNoLegacyWatchdog()
    .catch(()=>{
      assert(watchdogCheck.hasLegacyWatchdog.called);
    });
  });
});
