var prereqs, mockPlatform, assert = require("assert");

global.log = require("../logger.js")();

function setupMock(mockPlatform) {
  prereqs = require("../prereqs.js")(mockPlatform);
}

describe("prereqs", ()=>{
  it("allows windows", ()=>{
    var mockPlatform = {getOS() {return "win32";}};
    setupMock(mockPlatform);

    assert.ok(prereqs.validatePlatform());
  });
  it("fails when not windows or linux", ()=>{
    var mockPlatform = {getOS() {return "darwin";}};
    setupMock(mockPlatform);

    assert.ok(prereqs.validatePlatform() === false);
  });
  it("accepts ubuntu 14.04", ()=>{
    var mockPlatform = {
      getOS() {return "linux";},
      getUbuntuVer() {return "14.04";}
    };
    setupMock(mockPlatform);

    assert.ok(prereqs.validateOS());
  });
});