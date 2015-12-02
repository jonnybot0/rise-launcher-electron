var proxy = require("../../../common/proxy.js"),
assert = require("assert"),
simpleMock = require("simple-mock"),
platform = require("../../../common/platform.js"),
mock = require("simple-mock").mock;

describe("proxy", ()=>{
  beforeEach("setup mocks", ()=>{
    mock(platform, "writeTextFile").resolveWith();
  });

  afterEach("clean mocks", ()=>{
    simpleMock.restore();
  });

  it("sets new endpoint", ()=>{
    proxy.setEndpoint("127.0.0.1:8888");
    console.log(proxy.proxyFields);
    assert.equal(proxy.proxyFields.href, "http://127.0.0.1:8888/");
  });

  it("does not set the new endpoint", ()=>{
    mock(log, "all").returnWith();

    proxy.setEndpoint();
    assert(!log.all.called);
  });
});
