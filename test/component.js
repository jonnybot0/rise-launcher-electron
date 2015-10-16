var platform = require("../common/platform.js"),
network = require("../common/network.js"),
component = require("../component.js"),
assert = require("assert"),
mock = require("simple-mock").mock;

global.log = require("../logger.js")();

describe("component", ()=>{
  beforeEach("setup mocks", ()=>{

  });

  it("returns forced stable channel", ()=>{
    var comps = {
      ForceStable: "true",
      LatestRolloutPercent: "10"
    };

    assert.equal(component.getChannel(comps), "Stable");
  });

  it("returns regular stable channel", ()=>{
    var comps = {
      ForceStable: "false",
      LatestRolloutPercent: "10"
    };

    mock(component, "getLatestChannelProb").returnWith(20);

    assert.equal(component.getChannel(comps), "Stable");
  });

  it("returns latest channel", ()=>{
    var comps = {
      ForceStable: "false",
      LatestRolloutPercent: "10"
    };

    mock(component, "getLatestChannelProb").returnWith(5);

    assert.equal(component.getChannel(comps), "Latest");
  });

  it("returns Windows components url", ()=>{
    mock(platform, "getOS").returnWith("win32");

    assert.equal(component.getComponentsUrl(), "http://storage.googleapis.com/install-versions.risevision.com/remote-components-win.cfg");
  });

  it("returns Linux 32bit components url", ()=>{
    mock(platform, "getOS").returnWith("linux");
    mock(platform, "getArch").returnWith("x32");

    assert.equal(component.getComponentsUrl(), "http://storage.googleapis.com/install-versions.risevision.com/remote-components-lnx-32.cfg");
  });

  it("returns Linux 64bit components url", ()=>{
    mock(platform, "getOS").returnWith("linux");
    mock(platform, "getArch").returnWith("x64");

    assert.equal(component.getComponentsUrl(), "http://storage.googleapis.com/install-versions.risevision.com/remote-components-lnx-64.cfg");
  });

  it("returns browser is upgradeable because of new install", ()=>{
    return component.isBrowserUpgradeable().then((result)=>{
      assert.equal(result, true);
    });
  });

  it("returns browser is upgradeable because display id is configured that way", ()=>{
    mock(network, "httpFetch").resolveWith({
      text() { return "true"; }
    });
    
    return component.isBrowserUpgradeable("test").then((result)=>{
      assert.equal(network.httpFetch.lastCall.args[0], "https://rvaserver2.appspot.com/player/isBrowserUpgradeable?displayId=test");
      assert.equal(result, true);
    });
  });

  it("returns browser is not upgradeable because display id is not configured that way", ()=>{
    mock(network, "httpFetch").resolveWith({
      text() { return "false"; }
    });
    
    return component.isBrowserUpgradeable("test").then((result)=>{
      assert.equal(result, false);
    });
  });

  it("returns browser is not upgradeable because of network error", ()=>{
    mock(network, "httpFetch").rejectWith("network error");
    
    return component.isBrowserUpgradeable("test").then((result)=>{
      assert.equal(result, false);
    });
  });
});
