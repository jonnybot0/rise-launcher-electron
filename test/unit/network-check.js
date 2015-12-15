var checker = require("../../network-check.js"),
platform = require("../../common/platform.js"),
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

  it("checks for Electron connectivity to sites", ()=>{
    return checker.checkSitesWithElectron()
    .then((passed)=>{
      assert.ok(passed);
    });
  });

  it("fails on bad connectivity in Electron", ()=>{
    mock(network, "httpFetch").rejectWith(false);
    return checker.checkSitesWithElectron()
    .then((passed)=>{
      assert.fail();
    })
    .catch(()=>{
      assert.ok(true);
    });
  });

  it("fails on bad response", ()=>{
    mock(network, "httpFetch").resolveWith({ status: 500 });
    return checker.checkSitesWithElectron()
    .then((passed)=>{
      assert.fail();
    })
    .catch(()=>{
      assert.ok(true);
    });
  });

  it("checks for java connectivity to sites", ()=>{
    mock(platform, "spawn").resolveWith(0);

    return checker.checkSitesWithJava()
    .then((retCode)=>{
      assert.ok(platform.spawn.calls[0].args[0].indexOf("java") > 0);
    })
    .catch(()=>{
      assert.ok(false);
    });
  });

  it("throws on no java connectivity", ()=>{
    mock(platform, "spawn").resolveWith(1);

    return checker.checkSitesWithJava()
    .then(()=>{
      assert.ok(false);
    })
    .catch((err)=>{
      assert.equal(err.message, 1);
    });
  });
});
