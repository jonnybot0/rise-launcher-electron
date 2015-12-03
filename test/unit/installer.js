var platform = require("../../common/platform.js"),
autostart = require("../../autostart/autostart.js"),
installer = require("../../installer.js"),
component = require("../../component.js"),
downloader = require("../../downloader.js"),
launcher = require("../../launcher.js"),
optimization = require("../../os-optimization.js"),
capCheck = require("../../cap-check.js"),
watchdogCheck = require("../../watchdog-check.js"),
uninstall = require("./uninstall.js"),
stop = require("./stop.js"),
assert = require("assert"),
simpleMock = require("simple-mock"),
path = require("path"),
mock = require("simple-mock").mock,
components = {};

global.log = require("../../logger/logger.js")();
global.options = {};

describe("installer", ()=>{
  beforeEach("setup mocks", ()=>{
    components = {
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
        "localVersion": "2015.10.21.17.00",
        "name": "InstallerElectron",
        "remoteVersion": "2015.10.21.17.00",
        "url": "http://install-versions.risevision.com/rvplayer-installer-lnx-32.zip",
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
    };

    mock(platform, "getTempDir").returnWith("temp");
    mock(platform, "getInstallDir").returnWith("install");
    mock(platform, "extractZipTo").resolveWith();
    mock(platform, "startProcess").resolveWith();
    mock(platform, "setFilePermissions").resolveWith();
    mock(platform, "mkdir").resolveWith();
    mock(platform, "deleteRecursively").resolveWith();
    mock(platform, "execSync").returnWith();
    mock(platform, "onFirstRun").resolveWith();
    mock(platform, "writeTextFile").resolveWith();

    mock(downloader, "downloadComponents").resolveWith();
    mock(downloader, "extractComponents").resolveWith();
    mock(downloader, "installComponent").resolveWith();
    mock(downloader, "removePreviousVersions").resolveWith();
    
    mock(component, "getComponents").resolveWith(components);

    mock(launcher, "launch").resolveWith();

    mock(optimization, "updateSettings").returnWith();

    mock(capCheck, "isCAPInstalled").returnWith(false);

    mock(uninstall, "createUninstallOption").resolveWith();

    mock(stop, "createStopOption").resolveWith();

    mock(process, "exit").returnWith();
  });

  afterEach("clean mocks", ()=>{
    simpleMock.restore();
  });

  it("starts an installer update", ()=>{
    mock(platform, "getInstallerDir").returnWith("test");
    mock(platform, "getInstallerPath").returnWith("test/test.sh");

    return installer.startInstallerUpdate().then(()=>{
      assert(platform.setFilePermissions.called);
      assert(platform.startProcess.called);
      
      assert.equal(platform.startProcess.lastCall.args[0], "test/test.sh");
      assert.equal(platform.startProcess.lastCall.args[1].toString(), ["--update", "--path", "test"].toString());
    });
  });

  it("updates the Installer", ()=>{
    mock(platform, "copyFolderRecursive").resolveWith();
    mock(autostart, "createAutostart").resolveWith();

    return installer.updateInstaller("testPath", "1.2").then(()=>{
      assert(platform.copyFolderRecursive.called);
      assert.equal(platform.copyFolderRecursive.lastCall.args[0], "testPath");
      assert.equal(platform.copyFolderRecursive.lastCall.args[1], path.join("install", "Installer"));

      assert.equal(autostart.createAutostart.callCount, 1);
      assert.equal(optimization.updateSettings.callCount, 1);
    });
  });

  it("performs a normal startup without installing/updating", ()=>{
    mock(installer, "checkInstallerUpdateStatus").resolveWith();
    mock(installer, "isInstallerDeployed").returnWith(true);
    mock(watchdogCheck, "isWatchdogRunning").returnWith(false);

    return installer.begin().then(()=>{
      assert(installer.checkInstallerUpdateStatus.called);
      assert(!autostart.createAutostart.called);
      assert(!optimization.updateSettings.called);
      assert(platform.mkdir.called);
      assert(platform.deleteRecursively.called);
      assert(component.getComponents.called);
      assert(downloader.downloadComponents.called);
      assert(downloader.extractComponents.called);
      assert(downloader.removePreviousVersions.called);
      assert(!downloader.installComponent.called);
    });
  });

  it("performs a normal startup updating all components except installer", ()=>{
    components.Browser.versionChanged = true;
    components.Cache.versionChanged = true;
    components.Java.versionChanged = true;
    components.Player.versionChanged = true;

    mock(installer, "checkInstallerUpdateStatus").resolveWith();
    mock(installer, "isInstallerDeployed").returnWith(true);
    mock(watchdogCheck, "isWatchdogRunning").returnWith(false);

    return installer.begin().then(()=>{
      assert(installer.checkInstallerUpdateStatus.called);
      assert(!autostart.createAutostart.called);
      assert(!optimization.updateSettings.called);
      assert(platform.mkdir.called);
      assert(platform.deleteRecursively.called);
      assert(component.getComponents.called);
      assert(downloader.downloadComponents.called);
      assert(downloader.extractComponents.called);
      assert(downloader.removePreviousVersions.called);
      assert(downloader.installComponent.called);
      assert.equal(downloader.installComponent.callCount, 4);
    });
  });

  it("performs an installer update because it was not deployed", ()=>{
    mock(installer, "checkInstallerUpdateStatus").resolveWith();
    mock(installer, "isInstallerDeployed").returnWith(false);
    mock(installer, "updateInstaller").resolveWith();
    mock(watchdogCheck, "isWatchdogRunning").returnWith(false);
    
    return installer.begin().then(()=>{
      assert(installer.checkInstallerUpdateStatus.called);
      assert(installer.updateInstaller.called);
      assert(platform.mkdir.called);
      assert(platform.deleteRecursively.called);
      assert(component.getComponents.called);
      assert(downloader.downloadComponents.called);
      assert(downloader.extractComponents.called);
      assert(downloader.removePreviousVersions.called);
    });
  });

  it("performs an installer restart to overwrite current version", ()=>{
    mock(watchdogCheck, "isWatchdogRunning").returnWith(false);
    
    components.InstallerElectron.versionChanged = true;

    return installer.begin().then(()=>{
      assert(platform.setFilePermissions.called);
      assert(platform.startProcess.called);
      assert(process.exit.called);
    });
  });

  it("performs an installer update based on command line arguments", ()=>{
    mock(watchdogCheck, "isWatchdogRunning").returnWith(false);
    mock(installer, "isInstallerDeployed").returnWith(true);
    mock(installer, "updateInstaller").resolveWith();
    mock(installer, "getOptions").returnWith({
      update: true,
      path: "installerPath"
    });

    return installer.begin().then(()=>{
      assert(installer.updateInstaller.called);
      assert.equal(installer.updateInstaller.lastCall.args[0], "installerPath");
    });
  });

  it("handles errors on installer update checks", ()=>{
    mock(installer, "checkInstallerUpdateStatus").rejectWith();

    return installer.begin().catch(()=>{
      assert(installer.checkInstallerUpdateStatus.called);
    });
  });

  it("handles errors on components list fetch", ()=>{
    mock(component, "getComponents").rejectWith();
    mock(installer, "isInstallerDeployed").returnWith(false);
    mock(capCheck, "isCAPInstalled").returnWith(false);

    return installer.begin().catch(()=>{
      assert(component.getComponents.called);
    });
  });

  it("handles errors on components download", ()=>{
    mock(downloader, "downloadComponents").rejectWith();

    return installer.begin().catch(()=>{
      assert(downloader.downloadComponents.called);
    });
  });

  it("handles errors on components extraction", ()=>{
    mock(downloader, "extractComponents").rejectWith();

    return installer.begin().catch(()=>{
      assert(downloader.extractComponents.called);
    });
  });

  it("handles errors on components installation", ()=>{
    mock(downloader, "installComponents").rejectWith();

    return installer.begin().catch(()=>{
      assert(downloader.installComponents.called);
    });
  });

  it("gets a valid running installer directory", ()=>{
    mock(installer, "getCwd").returnWith(path.join("test", "installer"));

    var installerDir = installer.getRunningInstallerDir();

    assert.equal(installerDir, path.join("test", "installer"));
  });

  it("gets a valid running installer directory when manually invoking node", ()=>{
    mock(installer, "getCwd").returnWith(path.join("test", "installer", "resources", "app"));

    var installerDir = installer.getRunningInstallerDir();

    assert.equal(installerDir, path.join("test", "installer"));
  });

  it("does not start player if CAP is installed", ()=>{
    mock(installer, "isInstallerDeployed").returnWith(true);
    mock(capCheck, "isCAPInstalled").returnWith(true);

    return installer.begin().catch(()=>{
      assert(capCheck.isCAPInstalled.called);
      assert(!launcher.launch.called);
    });
  });

  it("does not start player if watchdog is running", ()=>{
    mock(installer, "isInstallerDeployed").returnWith(true);
    mock(watchdogCheck, "isWatchdogRunning").returnWith(true);

    return installer.begin().catch(()=>{
      assert(watchdogCheck.isWatchdogRunning.called);
      assert(!launcher.launch.called);
    });
  });
});
