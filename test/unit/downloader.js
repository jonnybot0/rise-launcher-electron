var platform = requireRoot("common/platform.js"),
network = requireRoot("common/network.js"),
config = requireRoot("common/config.js"),
downloader = requireRoot("installer/downloader.js"),
assert = require("assert"),
simpleMock = require("simple-mock"),
path = require("path"),
mock = require("simple-mock").mock;

global.log = requireRoot("logger/logger.js")();

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
    "InstallerElectron": {
      "localVersion": "2015.10.21.17.00",
      "name": "InstallerElectron",
      "remoteVersion": "2015.10.21.17.00",
      "url": "http://install-versions.risevision.com/rvplayer-installer-lnx-32.zip",
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
    mock(platform, "startProcess").resolveWith();
    mock(platform, "setFilePermissions").resolveWith();
    mock(platform, "deleteRecursively").resolveWith();
  });

  afterEach("clean mocks", ()=>{
    componentsList = [];
    simpleMock.restore();
  });

  it("downloads all components", ()=>{
    mock(network, "downloadFile").resolveWith("localPath");

    return downloader.downloadComponents(componentsList).then(()=>{
      assert.equal(network.downloadFile.callCount, 5);
      assert.equal(componentsList[0].localPath, "localPath");
    });
  });

  it("fails to download components", ()=>{
    mock(network, "downloadFile").rejectWith();

    return downloader.downloadComponents(componentsList).catch(()=>{
      assert(network.downloadFile.called);
    });
  });

  it("extracts all components", ()=>{
    return downloader.extractComponents(componentsList).then(()=>{
      assert.equal(platform.extractZipTo.callCount, 5);
    });
  });

  it("fails to extract components", ()=>{
    mock(platform, "unzipFile").rejectWith();

    return downloader.extractComponents(componentsList).catch((err)=>{
      assert(platform.extractZipTo.called);
      assert(err.message);
    });
  });

  it("removes previous versions of components", ()=>{
    return downloader.removePreviousVersions(componentsList).then(()=>{
      assert.equal(platform.deleteRecursively.callCount, 3);
    });
  });

  it("fails to remove previous versions of components", ()=>{
    mock(platform, "deleteRecursively").rejectWith("error");

    return downloader.removePreviousVersions(componentsList).catch((err)=>{
      assert(platform.deleteRecursively.called);
      assert(err);
    });
  });

  it("installs all components", ()=>{
    mock(downloader, "installComponent").resolveWith();

    return downloader.installComponents(componentsList).then(()=>{
      assert.equal(downloader.installComponent.callCount, 5);
    });
  });

  it("fails to install components", ()=>{
    mock(platform, "copyFolderRecursive").rejectWith();

    return downloader.installComponents(componentsList).catch((err)=>{
      assert(platform.copyFolderRecursive.called);
      assert(err.userFriendlyMessage);
    });
  });

  it("does not do anything for InstallerElectron", ()=>{
    mock(platform, "getOS").returnWith("linux");
    mock(platform, "copyFolderRecursive").resolveWith();
    mock(platform, "setFilePermissions").resolveWith();
    mock(config, "saveVersion").resolveWith();

    return downloader.installComponent(components.InstallerElectron).then((component)=>{
      assert(!platform.getOS.called);
      assert(!platform.copyFolderRecursive.called);
      assert(!platform.setFilePermissions.called);
      assert(!config.saveVersion.called);
    });
  });

  it("installs Chrome on Linux", ()=>{
    mock(platform, "getOS").returnWith("linux");
    mock(platform, "copyFolderRecursive").resolveWith();
    mock(platform, "setFilePermissions").resolveWith();
    mock(config, "saveVersion").resolveWith();

    return downloader.installComponent(components.Browser).then((component)=>{
      assert(platform.copyFolderRecursive.called);
      assert.equal(platform.copyFolderRecursive.lastCall.args[0], path.join("temp", "chrome-linux"));
      assert.equal(platform.copyFolderRecursive.lastCall.args[1], path.join("install", "chrome-linux"));
      assert.equal(component.destination, path.join("install", "chrome-linux"));
      assert(platform.setFilePermissions.called);
    });
  });

  it("installs Chrome on Windows", ()=>{
    mock(platform, "getOS").returnWith("win32");
    mock(platform, "copyFolderRecursive").resolveWith();
    mock(config, "saveVersion").resolveWith();

    return downloader.installComponent(components.Browser).then((component)=>{
      assert(platform.copyFolderRecursive.called);
      assert.equal(platform.copyFolderRecursive.lastCall.args[0], path.join("temp", "chrome-win32"));
      assert.equal(platform.copyFolderRecursive.lastCall.args[1], path.join("install", "chromium"));
      assert.equal(component.destination, path.join("install", "chromium"));
      assert(!platform.setFilePermissions.called);
    });
  });

  it("installs Java on Linux", ()=>{
    mock(platform, "isWindows").returnWith(false);
    mock(platform, "copyFolderRecursive").resolveWith();
    mock(config, "saveVersion").resolveWith();

    return downloader.installComponent(components.Java).then((component)=>{
      assert(platform.copyFolderRecursive.called);
      assert.equal(platform.copyFolderRecursive.lastCall.args[0], path.join("temp", "JRE", "jre"));
      assert.equal(platform.copyFolderRecursive.lastCall.args[1], path.join("install", "jre"));
      assert.equal(component.destination, path.join("install", "jre"));
      assert(platform.setFilePermissions.called);
    });
  });

  it("installs Java on Windows", ()=>{
    mock(platform, "isWindows").returnWith(true);
    mock(platform, "copyFolderRecursive").resolveWith();
    mock(config, "saveVersion").resolveWith();

    return downloader.installComponent(components.Java).then((component)=>{
      assert(platform.copyFolderRecursive.called);
      assert.equal(platform.copyFolderRecursive.lastCall.args[0], path.join("temp", "JRE"));
      assert.equal(platform.copyFolderRecursive.lastCall.args[1], path.join("install", "JRE"));
      assert.equal(component.destination, path.join("install", "JRE"));
      assert(!platform.setFilePermissions.called);
    });
  });

  it("installs Rise Cache", ()=>{
    mock(platform, "copyFolderRecursive").resolveWith();
    mock(config, "saveVersion").resolveWith();

    return downloader.installComponent(components.Cache).then((component)=>{
      assert(platform.copyFolderRecursive.called);
      assert.equal(platform.copyFolderRecursive.lastCall.args[0], path.join("temp", "RiseCache"));
      assert.equal(platform.copyFolderRecursive.lastCall.args[1], path.join("install", "RiseCache"));
      assert.equal(component.destination, path.join("install", "RiseCache"));
    });
  });

  it("installs Rise Player", ()=>{
    mock(platform, "copyFolderRecursive").resolveWith();
    mock(config, "saveVersion").resolveWith();

    return downloader.installComponent(components.Player).then((component)=>{
      assert(platform.copyFolderRecursive.called);
      assert.equal(platform.copyFolderRecursive.lastCall.args[0], path.join("temp", "RisePlayer.jar"));
      assert.equal(platform.copyFolderRecursive.lastCall.args[1], path.join("install", "RisePlayer.jar"));
      assert.equal(component.destination, path.join("install", "RisePlayer.jar"));
      
      assert.equal(config.saveVersion.callCount, 1);
      assert.equal(config.saveVersion.lastCall.args[1], "2015.01.01.12.00");
    });
  });

  it("fails to install a component", ()=>{
    mock(platform, "copyFolderRecursive").rejectWith();

    return downloader.installComponent(components.Cache).catch((err)=>{
      assert(platform.copyFolderRecursive.called);
      assert(err.userFriendlyMessage);
    });
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
});
