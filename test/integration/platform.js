var assert = require("assert"),
platform = require("rise-common-electron").platform;

describe("Platform", ()=>{
  it("exists", ()=>{
    assert.ok(platform);
  });
});
