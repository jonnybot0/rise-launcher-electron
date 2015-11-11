var platform = require("../../common/platform.js"),
network = require("../../common/network.js"),
config = require("../../common/config.js"),
component = require("../../component.js"),
assert = require("assert"),
simpleMock = require("simple-mock"),
thisInstallerVersion = require("../../version.json"),
mock = require("simple-mock").mock;

global.log = require("../../logger/logger.js")();

describe("component", ()=>{
  beforeEach("setup mocks", ()=>{

  });

  afterEach("clean mocks", ()=>{
    simpleMock.restore();
  });

  it("checks the latest channel probability is in the [0, 100] range", ()=>{
    var channelProb = component.getLatestChannelProb();

    assert(channelProb >= 0);
    assert(channelProb <= 100);
  });

  it("checks the testing channel has been requested", ()=>{
    mock(platform, "readTextFileSync").returnWith("ForceTesting=true");

    assert(component.isTestingChannelRequested());
  });

  it("checks the testing channel has been disabled", ()=>{
    mock(platform, "readTextFileSync").returnWith("ForceTesting=false");

    assert(!component.isTestingChannelRequested());
  });

  it("checks the testing channel has not been requested", ()=>{
    mock(platform, "readTextFileSync").returnWith("");

    assert(!component.isTestingChannelRequested());
  });

  it("returns forced testing channel", ()=>{
    var comps = {
      ForceStable: "false",
      LatestRolloutPercent: "10"
    };

    mock(component, "isTestingChannelRequested").returnWith(true);

    assert.equal(component.getChannel(comps), "Testing");
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

  it("returns Windows 32bit components url", ()=>{
    mock(platform, "getOS").returnWith("win32");
    mock(platform, "getArch").returnWith("ia32");

    assert.equal(component.getComponentsUrl(), "http://storage.googleapis.com/install-versions.risevision.com/electron-remote-components-win-32.cfg");
  });

  it("returns Windows 64bit components url", ()=>{
    mock(platform, "getOS").returnWith("win32");
    mock(platform, "getArch").returnWith("x64");

    assert.equal(component.getComponentsUrl(), "http://storage.googleapis.com/install-versions.risevision.com/electron-remote-components-win-64.cfg");
  });

  it("returns Linux 32bit components url", ()=>{
    mock(platform, "getOS").returnWith("linux");
    mock(platform, "getArch").returnWith("ia32");

    assert.equal(component.getComponentsUrl(), "http://storage.googleapis.com/install-versions.risevision.com/electron-remote-components-lnx-32.cfg");
  });

  it("returns Linux 64bit components url", ()=>{
    mock(platform, "getOS").returnWith("linux");
    mock(platform, "getArch").returnWith("x64");

    assert.equal(component.getComponentsUrl(), "http://storage.googleapis.com/install-versions.risevision.com/electron-remote-components-lnx-64.cfg");
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

  it("returns version of Cache has changed", ()=>{
    var comps = { CacheVersionStable: "2.0" };

    mock(config, "getVersion").resolveWith("2.1");
    
    return component.hasVersionChanged(comps, "Cache", "Stable").then((result)=>{
      assert(result.versionChanged);
    });
  });

  it("returns the components list", ()=>{
    mock(network, "httpFetch").resolveWith({
      status: 200,
      text() { return "content"; }
    });
    
    return component.getComponentsList().then((result)=>{
      assert.equal(result, "content");
    });
  });

  it("fails to return the components list because of server response", ()=>{
    mock(network, "httpFetch").resolveWith({
      status: 404
    });
    
    return component.getComponentsList().catch((err)=>{
      assert(err.message);
    });
  });

  it("fails to return the components list because of network error", ()=>{
    mock(network, "httpFetch").rejectWith("error");
    
    return component.getComponentsList().catch((err)=>{
      assert(err.message);
    });
  });

  it("returns processed components map", ()=>{
    return platform.readTextFile("test/unit/remote-components-lnx-32.cfg").then((data)=>{
      mock(platform, "getOS").returnWith("linux");
      mock(platform, "getArch").returnWith("32");
      mock(component, "getComponentsList").resolveWith(data);
      mock(component, "getChannel").returnWith("Stable");
      mock(component, "isBrowserUpgradeable").resolveWith(false);
      mock(component, "getLatestChannelProb").returnWith(50);
      mock(config, "getDisplaySettings").resolveWith({ displayid: "test" });
      mock(config, "getComponentVersion", (componentName)=>{
        return Promise.resolve({
          "InstallerElectron": thisInstallerVersion,
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
          "InstallerElectron": {
            "localVersion": thisInstallerVersion,
            "name": "InstallerElectron",
            "remoteVersion": "2015.10.21.17.00",
            "url": "http://install-versions.risevision.com/rvplayer-installer-lnx-32.zip",
            "versionChanged": true
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

  it("returns processed components map for testing channel", ()=>{
    return platform.readTextFile("test/unit/remote-components-lnx-32.cfg").then((data)=>{
      mock(platform, "getOS").returnWith("linux");
      mock(platform, "getArch").returnWith("32");
      mock(component, "getComponentsList").resolveWith(data);
      mock(component, "isTestingChannelRequested").returnWith(true);
      mock(component, "isBrowserUpgradeable").resolveWith(true);
      mock(config, "getDisplaySettings").resolveWith({ displayid: "test" });
      mock(config, "getComponentVersion", (componentName)=>{
        return Promise.resolve({
          "InstallerElectron": thisInstallerVersion,
          "Browser": "44.0.1200.000",
          "Cache": "2015.04.05.12.00",
          "Java": "7.80",
          "Player":"2015.01.01.12.00" }[componentName]);
      });

      return component.getComponents().then((comps)=>{
        assert.deepEqual(comps, {
          "Browser": {
            "localVersion": "44.0.1200.000",
            "name": "Browser",
            "remoteVersion": "46.0.2490.80",
            "url": "http://install-versions.risevision.com/chrome-linux-32-testing.zip",
            "versionChanged": true
          },
          "Cache": {
            "localVersion": "2015.04.05.12.00",
            "name": "Cache",
            "remoteVersion": "2015.04.05.12.00",
            "url": "http://install-versions.risevision.com/RiseCache-testing.zip",
            "versionChanged": false
          },
          "InstallerElectron": {
            "localVersion": thisInstallerVersion,
            "name": "InstallerElectron",
            "remoteVersion": "2015.10.21.17.00",
            "url": "http://install-versions.risevision.com/rvplayer-installer-lnx-32.zip",
            "versionChanged": true
          },
          "Java": {
            "localVersion": "7.80",
            "name": "Java",
            "remoteVersion": "7.82",
            "url": "http://install-versions.risevision.com/jre-7u82-linux-32.zip",
            "versionChanged": true
          },
          "Player": {
            "localVersion": "2015.01.01.12.00",
            "name": "Player",
            "remoteVersion": "2015.01.23.12.00",
            "url": "http://install-versions.risevision.com/RisePlayer-2015-01-23-12-00.zip",
            "versionChanged": true
          }
        });
      });
    });
  });

  it("returns processed components map updating browser", ()=>{
    return platform.readTextFile("test/unit/remote-components-lnx-32.cfg").then((data)=>{
      mock(platform, "getOS").returnWith("linux");
      mock(platform, "getArch").returnWith("32");
      mock(component, "getComponentsList").resolveWith(data);
      mock(component, "getChannel").returnWith("Stable");
      mock(component, "isBrowserUpgradeable").resolveWith(true);
      mock(component, "getLatestChannelProb").returnWith(50);
      mock(config, "getDisplaySettings").resolveWith({});
      mock(config, "getComponentVersion", (componentName)=>{
        return Promise.resolve({
          "InstallerElectron": thisInstallerVersion,
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
            "versionChanged": true
          },
          "Cache": {
            "localVersion": "2015.02.01.12.00",
            "name": "Cache",
            "remoteVersion": "2015.02.01.12.00",
            "url": "http://install-versions.risevision.com/RiseCache.zip",
            "versionChanged": false
          },
          "InstallerElectron": {
            "localVersion": thisInstallerVersion,
            "name": "InstallerElectron",
            "remoteVersion": "2015.10.21.17.00",
            "url": "http://install-versions.risevision.com/rvplayer-installer-lnx-32.zip",
            "versionChanged": true
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

  it("fails to return the components map after failing to get components list", ()=>{
    return platform.readTextFile("test/unit/remote-components-lnx-32.cfg").then((data)=>{
      mock(component, "getComponentsList").rejectWith("error");

      return component.getComponents().catch((err)=>{
        assert.equal(err, "error");
      });
    });
  });

  it("fails to return the components map", ()=>{
    return platform.readTextFile("test/unit/remote-components-lnx-32.cfg").then((data)=>{
      mock(platform, "getOS").returnWith("linux");
      mock(platform, "getArch").returnWith("32");
      mock(component, "getComponentsList").resolveWith(data);
      mock(component, "getChannel").returnWith("Stable");
      mock(component, "isBrowserUpgradeable").resolveWith(false);
      mock(component, "getLatestChannelProb").returnWith(50);
      mock(config, "getDisplaySettings").rejectWith("error");

      return component.getComponents().catch((err)=>{
        assert.equal(err, "error");
      });
    });
  });
});
