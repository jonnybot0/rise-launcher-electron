var platform = require("../../../common/platform.js"),
network = require("../../../common/network.js"),
fetch = require("node-fetch"),
http = require("http"),
urlParse = require("url").parse,
path = require("path"),
fs = require("fs"),
assert = require("assert"),
simpleMock = require("simple-mock"),
mock = require("simple-mock").mock;

describe("config", ()=>{
  beforeEach("setup mocks", ()=>{
    mock(platform, "getTempDir").returnWith("test");
    mock(fs, "createWriteStream").returnWith({
      write() {},
      end() {},
      on() {}
    });
  });

  afterEach("clean mocks", ()=>{
    simpleMock.restore();
  });

  it("downloads a file using the given url", ()=>{
    mock(http, "get").callbackWith({
      statusCode: 200,
      on(name, cb) {
        if(name === "end") { cb(); }
        if(name === "data") { cb(""); }
        if(name === "error") { cb("err"); }
      }
    });

    return network.downloadFile("http://install-versions.risevision.com/RiseCache.zip")
    .then((localPath)=>{
      assert.equal(localPath, path.join("test", "RiseCache.zip"));
    });
  });

  it("fails to download a file because it was not found", ()=>{
    mock(http, "get").callbackWith({
      statusCode: 404,
      on(name, cb) {
        if(name === "end") { cb(); }
      }
    });

    return network.downloadFile("http://install-versions.risevision.com/RiseCache.zip")
    .catch((err)=>{
      assert(err.message);
    });
  });

  it("fails to download a file", ()=>{
    mock(http, "get").callbackWith({
      statusCode: 500,
      on(name, cb) {
        if(name === "end") { cb(); }
      }
    });

    return network.downloadFile("http://install-versions.risevision.com/RiseCache.zip")
    .catch((err)=>{
      assert(err.message);
    });
  });
});
