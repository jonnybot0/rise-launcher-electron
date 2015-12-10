var proxy = require("../../../common/proxy.js"),
proxySetup = {},
assert = require("assert"),
simpleMock = require("simple-mock"),
platform = require("../../../common/platform.js"),
mock = require("simple-mock").mock;

proxy.observe((proxyFields)=>{proxySetup.proxyFields = proxyFields;});

describe("proxy", ()=>{
  beforeEach("setup mocks", ()=>{
    mock(platform, "writeTextFile").resolveWith();
  });

  afterEach("clean mocks", ()=>{
    simpleMock.restore();
  });

  it("sets new endpoint", ()=>{
    proxy.setEndpoint({address: "127.0.0.1", port: "8888"});
    assert.equal(proxySetup.proxyFields.href, "http://127.0.0.1:8888/");
  });

  it("does not set the new endpoint", ()=>{
    proxy.setEndpoint();
    assert.equal(proxySetup.proxyFields.href, "");
  });
});
