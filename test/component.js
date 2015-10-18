var platform = require("../common/platform.js"),
network = require("../common/network.js"),
config = require("../common/config.js"),
component = require("../component.js"),
assert = require("assert"),
simpleMock = require("simple-mock"),
mock = require("simple-mock").mock;

global.log = require("../logger.js")();

describe("component", ()=>{
  beforeEach("setup mocks", ()=>{
    
  });

  afterEach("clean mocks", ()=>{
    simpleMock.restore();
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

  it("returns version of Cache has not changed", ()=>{
    var comps = { CacheVersionStable: "2.0" };

    mock(config, "getVersion").resolveWith("2.0");
    
    return component.hasVersionChanged(comps, "Cache", "Stable").then((result)=>{
      assert(!result.changed);
    });
  });

  it("returns version of Cache has changed", ()=>{
    var comps = { CacheVersionStable: "2.0" };

    mock(config, "getVersion").resolveWith("2.1");
    
    return component.hasVersionChanged(comps, "Cache", "Stable").then((result)=>{
      assert(result.versionChanged);
    });
  });

  it("returns processed components map", ()=>{
    return platform.readTextFile("test/remote-components-lnx-32.cfg").then((data)=>{
      mock(platform, "getOS").returnWith("linux");
      mock(platform, "getArch").returnWith("32");
      mock(component, "getComponentsList").resolveWith(data);
      mock(component, "getChannel").returnWith("Stable");
      mock(component, "isBrowserUpgradeable").resolveWith(false);
      mock(component, "getLatestChannelProb").returnWith(50);
      mock(config, "getDisplaySettings").resolveWith({ displayid: "test" });
      mock(config, "getVersion", (componentName)=>{
        return Promise.resolve({
          "Installer": "2015.06.01.12.00",
          "Browser": "44.0.1200.000", // Changed, but will be versionChanged==false because of isBrowserUpgradeable
          "Cache": "2015.02.01.12.00",
          "Java": "7.80",
          "Player":"2015.01.01.12.00" }[componentName]);
      });

      return component.getComponents().then((comps)=>{
        assert.deepEqual(comps, {
          "Browser": {
            "localVersion": "44.0.1200.000",
            "name": "Browser",
            "remoteVersion": "44.0.2400.000",
            "url": "http://install-versions.risevision.com/chrome-linux-32.zip",
            "versionChanged": false
          },
          "Cache": {
            "localVersion": "2015.02.01.12.00",
            "name": "Cache",
            "remoteVersion": "2015.02.01.12.00",
            "url": "http://install-versions.risevision.com/RiseCache.zip",
            "versionChanged": false
          },
          "Installer": {
            "localVersion": "2015.06.01.12.00",
            "name": "Installer",
            "remoteVersion": "2015.06.01.12.00",
            "url": "http://install-versions.risevision.com/rvplayer-installer.sh",
            "versionChanged": false
          },
          "Java": {
            "localVersion": "7.80",
            "name": "Java",
            "remoteVersion": "7.80",
            "url": "http://install-versions.risevision.com/jre-7u80-linux-32.zip",
            "versionChanged": false
          },
          "Player": {
            "localVersion": "2015.01.01.12.00",
            "name": "Player",
            "remoteVersion": "2015.01.01.12.00",
            "url": "http://install-versions.risevision.com/RisePlayer-2015-01-01-12-00.zip",
            "versionChanged": false
          }
        });
      });
    });
  });
});
