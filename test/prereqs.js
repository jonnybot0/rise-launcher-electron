var prereqs = require("../prereqs.js"),
assert = require("assert");

global.log = require("../logger.js")();

describe("prereqs", ()=>{
  it("checks platform", ()=>{
    assert.ok(prereqs.validatePlatform());
  });
  xit("accepts ubuntu 14.04", ()=>{
    assert.ok(prereqs.validateOS());
  });
});
