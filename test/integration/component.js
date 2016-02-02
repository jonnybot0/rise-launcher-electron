var assert = require("assert"),
component = requireRoot("installer/component.js");
global.log = require("rise-common-electron").logger();

describe("Component", ()=>{
  it("exists", ()=>{
    assert.ok(component);
  });

  it("downloads the components list", ()=>{
    return component.getComponentsList().then((result)=>{
      console.log(result);
      assert.ok(result.includes("Stable"));
    });
  });
});
