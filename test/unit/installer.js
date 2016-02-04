var platform = require("rise-common-electron").platform,
autostart = requireRoot("installer/autostart/autostart.js"),
installer = requireRoot("installer/installer.js"),
component = requireRoot("installer/component.js"),
downloader = requireRoot("installer/downloader.js"),
launcher = requireRoot("installer/launcher.js"),
optimization = requireRoot("installer/os-optimization.js"),
capCheck = requireRoot("installer/cap-check.js"),
watchdogCheck = requireRoot("installer/watchdog-check.js"),
uninstall = require("./uninstall.js"),
stop = {},
assert = require("assert"),
simpleMock = require("simple-mock"),
path = require("path"),
mock = require("simple-mock").mock,
components = {};

global.log = require("rise-common-electron").logger();
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
    mock(platform, "killJava").resolveWith();
    mock(platform, "killChromium").resolveWith();
    mock(platform, "waitForMillis").resolveWith();
    
    mock(downloader, "downloadComponents").resolveWith();
    mock(downloader, "extractComponents").resolveWith();
    mock(downloader, "installComponent").resolveWith();
    mock(downloader, "removePreviousVersions").resolveWith();
    
    mock(component, "getComponents").resolveWith(components);

    mock(launcher, "launch").resolveWith();

    mock(optimization, "updateSettings").returnWith();

    mock(capCheck, "isCAPInstalled").returnWith(false);

    mock(uninstall, "createUninstallOption").resolveWith();

    mock(stop, "createStopStartLinks").resolveWith();

    mock(process, "exit").returnWith();
  });

  afterEach("clean mocks", ()=>{
    simpleMock.restore();
  });

  it("starts an installer update", ()=>{
    var closed = false;
    mock(platform, "getInstallerPath").returnWith("test/test.sh");
    installer.setMainWindow({close(){closed = true;}});


    return installer.startInstallerUpdate().then(()=>{
      assert(platform.setFilePermissions.called);
      assert(platform.startProcess.called);
      
      assert.equal(platform.startProcess.lastCall.args[0], path.join("temp", "Installer", platform.getInstallerName()));
      assert.equal(platform.startProcess.lastCall.args[1].toString(), ["--unattended", "--update", "--path", path.join("temp", "Installer")].toString());
      assert(closed);
    });
  });

  it("updates the Installer", ()=>{
    mock(platform, "copyFolderRecursive").resolveWith();
    mock(autostart, "setAutostart").resolveWith();

    return installer.updateInstaller("testPath", "1.2").then(()=>{
      assert(platform.copyFolderRecursive.called);
      assert.equal(platform.copyFolderRecursive.lastCall.args[0], "testPath");
      assert.equal(platform.copyFolderRecursive.lastCall.args[1], path.join("install", "Installer"));
    });
  });

  it("performs a normal startup without installing/updating", ()=>{
    mock(installer, "checkInstallerUpdateStatus").resolveWith();
    mock(platform, "getRunningPlatformDir").returnWith(platform.getInstallerDir());
    mock(watchdogCheck, "isWatchdogRunning").returnWith(false);

    return installer.begin().then(()=>{
      assert(installer.checkInstallerUpdateStatus.called);
      assert(!autostart.setAutostart.called);
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
    mock(installer, "isOldInstallerDeployed").returnWith(false);
    mock(installer, "removeOldInstaller").resolveWith();
    mock(platform, "getRunningPlatformDir").returnWith(platform.getInstallerDir());
    mock(watchdogCheck, "isWatchdogRunning").returnWith(false);

    return installer.begin().then(()=>{
      assert(installer.checkInstallerUpdateStatus.called);
      assert(!installer.removeOldInstaller.called);
      assert(!autostart.setAutostart.called);
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
    mock(installer, "isOldInstallerDeployed").returnWith(true);
    mock(installer, "updateInstaller").resolveWith();
    mock(installer, "removeOldInstaller").resolveWith();
    mock(watchdogCheck, "isWatchdogRunning").returnWith(false);
    
    return installer.begin().then(()=>{
      assert(installer.checkInstallerUpdateStatus.called);
      assert(installer.updateInstaller.called);
      assert(installer.removeOldInstaller.called);
      assert(platform.mkdir.called);
      assert(platform.deleteRecursively.called);
      assert(component.getComponents.called);
      assert(downloader.downloadComponents.called);
      assert(downloader.extractComponents.called);
      assert(downloader.removePreviousVersions.called);
    });
  });

  it("performs an installer update because it was not deployed and checks old installer removal is performed", ()=>{
    mock(installer, "checkInstallerUpdateStatus").resolveWith();
    mock(installer, "isOldInstallerDeployed").returnWith(true);
    mock(installer, "updateInstaller").resolveWith();
    mock(watchdogCheck, "isWatchdogRunning").returnWith(false);
    
    return installer.begin().then(()=>{
      assert(platform.deleteRecursively.called);
    });
  });

  it("performs an installer restart to overwrite current version", ()=>{
    components.InstallerElectron.versionChanged = true;

    return installer.begin().then(()=>{
      assert(platform.setFilePermissions.called);
      assert(platform.startProcess.called);
    });
  });

  it("performs an installer update from a new downloaded version", ()=>{
    mock(watchdogCheck, "isWatchdogRunning").returnWith(false);
    mock(installer, "updateInstaller").resolveWith();
    mock(platform, "getRunningPlatformDir").returnWith(platform.getInstallerDir());
    mock(installer, "getOptions").returnWith({
      update: true,
      path: "installerPath"
    });

    return installer.begin().then(()=>{
      assert(installer.updateInstaller.called);
      assert.equal(installer.updateInstaller.lastCall.args[0], "installerPath");
    });
  });

  it("performs an installer update because it wasn't running from the correct directory", ()=>{
    mock(watchdogCheck, "isWatchdogRunning").returnWith(false);
    mock(installer, "updateInstaller").resolveWith();
    mock(installer, "getOptions").returnWith({
      update: true,
      path: "installerPath"
    });

    return installer.begin().then(()=>{
      assert(installer.updateInstaller.called);
      assert.equal(installer.updateInstaller.lastCall.args[0], installer.getRunningInstallerDir());
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
    mock(platform, "getCwd").returnWith(path.join("test", "installer"));

    var installerDir = installer.getRunningInstallerDir();

    assert.equal(installerDir, path.join("test", "installer"));
  });

  it("gets a valid running installer directory when manually invoking node", ()=>{
    mock(platform, "getCwd").returnWith(path.join("test", "installer", "resources", "app"));

    var installerDir = installer.getRunningInstallerDir();

    assert.equal(installerDir, path.join("test", "installer"));
  });

  it("does not start player if CAP is installed", ()=>{
    mock(platform, "getRunningPlatformDir").returnWith(platform.getInstallerDir());
    mock(capCheck, "isCAPInstalled").returnWith(true);

    return installer.begin().catch(()=>{
      assert(capCheck.isCAPInstalled.called);
      assert(!launcher.launch.called);
    });
  });

  it("does not start player if watchdog is running", ()=>{
    mock(platform, "getRunningPlatformDir").returnWith(platform.getInstallerDir());
    mock(watchdogCheck, "isWatchdogRunning").returnWith(true);

    return installer.begin().catch(()=>{
      assert(watchdogCheck.isWatchdogRunning.called);
      assert(!launcher.launch.called);
    });
  });

  it("continues start up process if connectivity fails but player is already installed", ()=>{
    mock(platform, "fileExists").returnWith(true);
    mock(component, "getComponents").rejectWith({ userFriendlyMessage: messages.noNetworkConnection });

    return installer.begin().then(()=>{
      assert(component.getComponents.called);
      assert(!downloader.downloadComponents.called);
      assert(!downloader.extractComponents.called);
      assert(!downloader.removePreviousVersions.called);
      assert(!downloader.installComponent.called);
    });
  });

  it("does not continue start up process if connectivity fails and player is not already installed", ()=>{
    mock(platform, "fileExists").returnWith(true);
    mock(component, "getComponents").rejectWith({ userFriendlyMessage: "Generic error" });

    return installer.begin().catch(()=>{
      assert(component.getComponents.called);
      assert(!downloader.downloadComponents.called);
      assert(!downloader.extractComponents.called);
      assert(!downloader.removePreviousVersions.called);
      assert(!downloader.installComponent.called);
    });
  });
});
