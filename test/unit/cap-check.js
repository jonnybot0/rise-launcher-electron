var capCheck = requireRoot("installer/cap-check.js"),
platform = requireRoot("common/platform.js"),
fs = require("fs"),
path = require("path"),
assert = require("assert"),
simpleMock = require("simple-mock"),
mock = require("simple-mock").mock;

var winChromeHome = path.join("home", "Google", "Chrome", "User Data");
var linuxChromeHome = path.join("home", ".config", "google-chrome");
var risePlayerAppId = "ilcmohdkjfcfekfmpdppgoaaemgdmhaa";

describe("CAP check", ()=>{
  beforeEach("setup mocks", ()=>{
    mock(platform, "getHomeDir").returnWith("home");
    mock(fs, "statSync").callFn((basePath)=>{
      return {
        isDirectory() {
          return basePath.indexOf(risePlayerAppId) >= 0 || basePath.indexOf("Default") >= 0;
        }
      };
    });
  });

  afterEach("clean mocks", ()=>{
    simpleMock.restore();
  });

  it("checks CAP is installed on Windows", ()=>{
    mock(platform, "isWindows").returnWith(true);
    mock(fs, "readdirSync").callFn((basePath)=>{
      if(basePath === winChromeHome) {
        return [ "Default", "Other" ];
      }
      else if(basePath === path.join(winChromeHome, "Default")) {
        return [ "Extensions" ];
      }
      else if(basePath === path.join(winChromeHome, "Default", "Extensions")) {
        return [ risePlayerAppId ];
      }
    });

    assert(capCheck.isCAPInstalled());
  });

  it("checks CAP is not installed on Windows", ()=>{
    mock(platform, "isWindows").returnWith(true);
    mock(fs, "readdirSync").callFn((basePath)=>{
      if(basePath === winChromeHome) {
        return [ "Default", "Other" ];
      }
      else if(basePath === path.join(winChromeHome, "Default")) {
        return [];
      }
    });

    assert(!capCheck.isCAPInstalled());
  });

  it("checks CAP is not installed on Windows because Chrome is not installed (readdirSync throws an Error)", ()=>{
    mock(platform, "isWindows").returnWith(true);
    mock(fs, "readdirSync").throwWith("Error");

    assert(!capCheck.isCAPInstalled());
  });

  it("checks CAP is installed on Linux", ()=>{
    mock(platform, "isWindows").returnWith(false);
    mock(fs, "readdirSync").callFn((basePath)=>{
      if(basePath === linuxChromeHome) {
        return [ "Default", "Other" ];
      }
      else if(basePath === path.join(linuxChromeHome, "Default")) {
        return [ "Extensions" ];
      }
      else if(basePath === path.join(linuxChromeHome, "Default", "Extensions")) {
        return [ risePlayerAppId ];
      }
    });

    assert(capCheck.isCAPInstalled());
  });

  it("checks CAP is not installed on Linux", ()=>{
    mock(platform, "isWindows").returnWith(false);
    mock(fs, "readdirSync").callFn((basePath)=>{
      if(basePath === linuxChromeHome) {
        return [ "Default", "Other" ];
      }
      else if(basePath === path.join(linuxChromeHome, "Default")) {
        return [];
      }
    });

    assert(!capCheck.isCAPInstalled());
  });
});
