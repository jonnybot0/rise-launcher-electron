var proxy = require("../../../common/proxy.js"),
assert = require("assert"),
simpleMock = require("simple-mock"),
mock = require("simple-mock").mock;

describe("config", ()=>{
  afterEach("clean mocks", ()=>{
    simpleMock.restore();
  });

  it("sets new endpoint", ()=>{
    proxy.setEndpoint("127.0.0.1:8888");
    console.log(proxy.proxyFields);
    assert.equal(proxy.proxyFields.href, "http://127.0.0.1:8888/");
  });
});
