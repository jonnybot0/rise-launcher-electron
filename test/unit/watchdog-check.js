var watchdogCheck = require("../../watchdog-check.js"),
platform = require("../../common/platform.js"),
childProcess = require("child_process"),
assert = require("assert"),
simpleMock = require("simple-mock"),
mock = require("simple-mock").mock;

var noInstanceAvailable = "No Instance(s) Available.";
var executablePath = 
`ExecutablePath
C:\\Users\\Francisco\\Downloads\\appmonitor\\ApplicationMonitor.exe`;
var matchingFile = `<?xml version="1.0" standalone="yes"?>
<ApplicationMonitor xmlns="http://tempuri.org/Programs.xsd">
  <program>
    <name>hhh</name>
    <time>20,00</time>
    <path>"C:\\Users\\Francisco\\Downloads\\rvplayer-installer.exe"</path>
    <check>true</check>
  </program>
</ApplicationMonitor>`;
var notMatchingFile = `<?xml version="1.0" standalone="yes"?>
<ApplicationMonitor xmlns="http://tempuri.org/Programs.xsd">
</ApplicationMonitor>`;

describe("watchdog check", ()=>{
  beforeEach("setup mocks", ()=>{
  });

  afterEach("clean mocks", ()=>{
    simpleMock.restore();
  });

  it("checks watchdog is running on Windows", ()=>{
    mock(platform, "isWindows").returnWith(true);
    mock(childProcess, "execSync").returnWith(new Buffer(executablePath));
    mock(platform, "readTextFileSync").returnWith(matchingFile);

    assert(watchdogCheck.isWatchdogRunning());
  });

  it("checks watchdog is running on Windows but not watching programs of interest", ()=>{
    mock(platform, "isWindows").returnWith(true);
    mock(childProcess, "execSync").returnWith(new Buffer(executablePath));
    mock(platform, "readTextFileSync").returnWith(notMatchingFile);

    assert(!watchdogCheck.isWatchdogRunning());
  });

  it("checks watchdog is not running on Windows", ()=>{
    mock(platform, "isWindows").returnWith(true);
    mock(childProcess, "execSync").returnWith(new Buffer(noInstanceAvailable));

    assert(!watchdogCheck.isWatchdogRunning());
  });

  it("checks watchdog validation failed but does not crash installer", ()=>{
    mock(platform, "isWindows").returnWith(true);
    mock(childProcess, "execSync").throwWith("error");

    assert(!watchdogCheck.isWatchdogRunning());
  });

  it("checks watchdog is not running on Linux", ()=>{
    mock(platform, "isWindows").returnWith(false);

    assert(!watchdogCheck.isWatchdogRunning());
  });
});
