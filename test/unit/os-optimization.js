var platform = require("../../common/platform.js"),
optimization = require("../../os-optimization.js"),
childProcess = require("child_process"),
assert = require("assert"),
simpleMock = require("simple-mock"),
mock = require("simple-mock").mock;

global.log = require("../../logger/logger.js")();

describe("launcher", ()=>{
  beforeEach("setup mocks", ()=>{
    mock(childProcess, "execSync").returnWith();
    mock(platform, "getInstallerPath").returnWith();
  });

  afterEach("clean mocks", ()=>{
    simpleMock.restore();
  });

  it("updates Windows Settings", ()=>{
    mock(platform, "isWindows").returnWith(true);
    mock(optimization, "updateWindowsSettings").returnWith();

    optimization.updateSettings();

    assert(optimization.updateWindowsSettings.called);
  });

  it("updates Linux Settings", ()=>{
    mock(platform, "isWindows").returnWith(false);
    mock(optimization, "updateLinuxSettings").returnWith();

    optimization.updateSettings();

    assert(optimization.updateLinuxSettings.called);
  });

  it("updates Windows Settings calling each sub section", ()=>{
    mock(optimization, "disableWindowsScreenSaver").returnWith();
    mock(optimization, "updateWindowsPowerSettings").returnWith();
    mock(optimization, "disableWindowsChromeHDPIScaling").returnWith();
    mock(optimization, "disableWindowsSecurityAlerts").returnWith();
    mock(optimization, "disableWindowsOnscreenKeyboard").returnWith();

    optimization.updateWindowsSettings();

    assert(optimization.disableWindowsScreenSaver.called);
    assert(optimization.updateWindowsPowerSettings.called);
    assert(optimization.disableWindowsChromeHDPIScaling.called);
    assert(optimization.disableWindowsSecurityAlerts.called);
    assert(optimization.disableWindowsOnscreenKeyboard.called);
  });

  it("disable Windows ScreenSaver", ()=>{
    optimization.disableWindowsScreenSaver();

    assert.equal(childProcess.execSync.callCount, 3);
  });

  it("updates Windows Power Settings", ()=>{
    optimization.updateWindowsPowerSettings();

    assert.equal(childProcess.execSync.callCount, 9);
  });

  it("disables Windows Chrome HDPI Scaling", ()=>{
    optimization.disableWindowsChromeHDPIScaling();

    assert.equal(childProcess.execSync.callCount, 1);
  });

  it("disable Windows Security Alerts", ()=>{
    optimization.disableWindowsSecurityAlerts();

    assert.equal(childProcess.execSync.callCount, 1);
  });

  it("disable Windows Onscreen Keyboard", ()=>{
    optimization.disableWindowsOnscreenKeyboard();

    assert.equal(childProcess.execSync.callCount, 1);
  });
});
