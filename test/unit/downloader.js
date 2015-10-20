var platform = require("../../common/platform.js"),
network = require("../../common/network.js"),
config = require("../../common/config.js"),
downloader = require("../../downloader.js"),
assert = require("assert"),
simpleMock = require("simple-mock"),
path = require("path"),
fs = require("fs"),
mock = require("simple-mock").mock;

global.log = require("../../logger/logger.js")();

describe("downloader", ()=>{
  var componentsList = [];
  var components = {
    "Browser": {
      "localVersion": "43.0.1200.000",
      "name": "Browser",
      "remoteVersion": "44.0.2400.000",
      "url": "http://install-versions.risevision.com/chrome-linux-32.zip",
      "versionChanged": true
    },
    "Cache": {
      "localVersion": "2014.02.01.12.00",
      "name": "Cache",
      "remoteVersion": "2015.02.01.12.00",
      "url": "http://install-versions.risevision.com/RiseCache.zip",
      "versionChanged": true
    },
    "Installer": {
      "localVersion": "2014.06.01.12.00",
      "name": "Installer",
      "remoteVersion": "2015.06.01.12.00",
      "url": "http://install-versions.risevision.com/rvplayer-installer.sh",
      "versionChanged": true
    },
    "Java": {
      "localVersion": "7.80",
      "name": "Java",
      "remoteVersion": "7.90",
      "url": "http://install-versions.risevision.com/jre-7u90-linux-32.zip",
      "versionChanged": false
    },
    "Player": {
      "localVersion": "2014.01.01.12.00",
      "name": "Player",
      "remoteVersion": "2015.01.01.12.00",
      "url": "http://install-versions.risevision.com/RisePlayer-2015-01-01-12-00.zip",
      "versionChanged": false
    }
  };

  beforeEach("setup mocks", ()=>{
    for(var name in components) {
      componentsList.push(components[name]);
    }

    mock(platform, "getTempDir").returnWith("temp");
    mock(platform, "getInstallDir").returnWith("install");
    mock(platform, "extractZipTo").resolveWith();
  });

  afterEach("clean mocks", ()=>{
    componentsList = [];
    simpleMock.restore();
  });

  it("unzips a file", ()=>{
    return downloader.unzipFile("file1.zip", "").then(()=>{
      assert(platform.extractZipTo.called);
      assert.equal(platform.extractZipTo.lastCall.args[1], "temp");
    });
  });

  it("fails to unzip a file", ()=>{
    mock(platform, "extractZipTo").rejectWith();

    return downloader.unzipFile("wrong-file1.zip", "").catch(()=>{
      assert(platform.extractZipTo.called);
    });
  });

  it("unzips a file into a subdirectory", ()=>{
    return downloader.unzipFile("file1.zip", "subdir").then(()=>{
      assert(platform.extractZipTo.called);
      assert.equal(platform.extractZipTo.lastCall.args[1], path.join("temp", "subdir"));
    });
  });

  it("handles zip content for Chrome Linux", ()=>{
    mock(platform, "getOS").returnWith("linux");
    mock(platform, "moveFile").resolveWith();

    return downloader.installComponent(components.Browser).then((component)=>{
      assert(platform.moveFile.called);
      assert.equal(platform.moveFile.lastCall.args[0], path.join("temp", "chromium"));
      assert.equal(platform.moveFile.lastCall.args[1], path.join("install", "chromium"));
      assert.equal(component.destination, path.join("install", "chromium"));
    });
  });

  it("handles zip content for Chrome Windows", ()=>{
    mock(platform, "getOS").returnWith("win32");
    mock(platform, "moveFile").resolveWith();

    return downloader.installComponent(components.Browser).then((component)=>{
      assert(platform.moveFile.called);
      assert.equal(platform.moveFile.lastCall.args[0], path.join("temp", "chromium-win32"));
      assert.equal(platform.moveFile.lastCall.args[1], path.join("install", "chromium"));
      assert.equal(component.destination, path.join("install", "chromium"));
    });
  });

  it("handles zip content for Rise Cache", ()=>{
    mock(platform, "moveFile").resolveWith();

    return downloader.installComponent(components.Cache).then((component)=>{
      assert(platform.moveFile.called);
      assert.equal(platform.moveFile.lastCall.args[0], path.join("temp", "RiseCache"));
      assert.equal(platform.moveFile.lastCall.args[1], path.join("install", "RiseCache"));
      assert.equal(component.destination, path.join("install", "RiseCache"));
    });
  });

  it("handles zip content for Java", ()=>{
    mock(platform, "moveFile").resolveWith();

    return downloader.installComponent(components.Java).then((component)=>{
      assert(platform.moveFile.called);
      assert.equal(platform.moveFile.lastCall.args[0], path.join("temp", "JRE"));
      assert.equal(platform.moveFile.lastCall.args[1], path.join("install", "JRE"));
      assert.equal(component.destination, path.join("install", "JRE"));
    });
  });

  it("handles zip content for Rise Player", ()=>{
    mock(platform, "moveFile").resolveWith();

    return downloader.installComponent(components.Player).then((component)=>{
      assert(platform.moveFile.called);
      assert.equal(platform.moveFile.lastCall.args[0], path.join("temp", "RisePlayer.jar"));
      assert.equal(platform.moveFile.lastCall.args[1], path.join("install", "RisePlayer.jar"));
      assert.equal(component.destination, path.join("install", "RisePlayer.jar"));
    });
  });

  it("fails to handle zip content", ()=>{
    mock(platform, "moveFile").rejectWith();

    return downloader.installComponent(components.Cache).catch((err)=>{
      assert(platform.moveFile.called);
      assert(err.message);
    });
  });

  it("installs all components", ()=>{
    mock(downloader, "installComponent").resolveWith();

    return downloader.installComponents(componentsList).then(()=>{
      assert.equal(downloader.installComponent.callCount, 5);
    });
  });

  it("fails to install components", ()=>{
    mock(platform, "moveFile").rejectWith();

    return downloader.installComponents(componentsList).catch((err)=>{
      assert(platform.moveFile.called);
      assert(err.message);
    });
  });

  it("extracts all components except Installer", ()=>{
    return downloader.extractComponents(componentsList).then(()=>{
      assert.equal(platform.extractZipTo.callCount, 4);
    });
  });

  it("fails to extract components", ()=>{
    mock(platform, "unzipFile").rejectWith();

    return downloader.extractComponents(componentsList).catch((err)=>{
      assert(platform.extractZipTo.called);
      assert(err.message);
    });
  });

  it("downloads all components", ()=>{
    mock(network, "downloadFile").resolveWith();

    return downloader.downloadComponents(componentsList).then(()=>{
      assert.equal(network.downloadFile.callCount, 5);
    });
  });

  it("fails to download components", ()=>{
    mock(network, "downloadFile").rejectWith();

    return downloader.downloadComponents(componentsList).catch(()=>{
      assert(network.downloadFile.called);
    });
  });
});
