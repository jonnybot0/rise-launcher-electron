var prereqs = require("../../prereqs.js"),
platform = require("../../common/platform.js"),
networkCheck = require("../../network-check.js"),
mock = require("simple-mock").mock,
simpleMock = require("simple-mock"),
assert = require("assert");

global.log = require("../../logger/logger.js")();

describe("prereqs", ()=>{
  afterEach("reset mocks", ()=>{
    simpleMock.restore();
  });

  it("allows windows", ()=>{
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

  it("checks network connectivity", ()=>{
    mock(networkCheck, "checkSites").resolveWith(true);
    prereqs.checkNetworkConnectivity().then(()=>{assert.ok(true);});
  });
});
