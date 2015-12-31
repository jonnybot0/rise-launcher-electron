var assert = require("assert"),
downloader = requireRoot("installer/downloader.js");

describe("downloader", ()=>{
  var componentsList = "", listObject;

  it("exists", ()=>{
    assert.ok(downloader);
  });

  it("downloads the components list", ()=>{
    console.dir(downloader);
    return downloader.getComponentsList().then((result)=>{
      console.log(result);
      assert.ok(result.includes("Stable"));
      componentsList = result;
    });
  });

  it("parses the list", ()=>{
    listObject = downloader.parseComponentsList(componentsList);
    console.dir(listObject);
  });

  it("downloads a file", ()=>{
    console.log("downloading " + listObject.PlayerURLStable);
    return downloader.downloadFile(listObject.PlayerURLStable);
  });
});
