var checker = require("../../network-check.js"),
network = require("../../common/network.js"),
assert = require("assert"),
simpleMock = require("simple-mock"),
mock = require("simple-mock").mock;

describe("network check", ()=>{
  beforeEach("setup mocks", ()=>{
    mock(network, "httpFetch").resolveWith(true);
  });

  afterEach("clean mocks", ()=>{
    simpleMock.restore();
  });

  it("exists", ()=>{
    assert.ok(network);
  });

  it("checks for connectivity to sites", ()=>{
    return checker.checkSites()
    .then((passed)=>{
      assert.ok(passed);
    });
  });

  it("fails on bad connectivity", ()=>{
    mock(network, "httpFetch").rejectWith(false);
    return checker.checkSites()
    .then((passed)=>{
      assert.fail();
    })
    .catch(()=>{
      assert.ok(true);
    });
  });
});
