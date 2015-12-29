var checker = requireRoot("installer/network-check.js"),
platform = requireRoot("common/platform.js"),
network = requireRoot("common/network.js"),
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
    return checker.checkSitesWithElectron(0)
    .then((passed)=>{
      assert.fail();
    })
    .catch(()=>{
      assert.ok(true);
    });
  });

  it("retries on bad connectivity in Electron", ()=>{
    mock(network, "httpFetch").rejectWith(false);
    return checker.checkSitesWithElectron(1, 100)
    .catch(()=>{
      assert.ok(network.httpFetch.callCount > 9);
    });
  });

  it("fails on bad response", ()=>{
    mock(network, "httpFetch").resolveWith({ status: 500 });
    return checker.checkSitesWithElectron(0)
    .then((passed)=>{
      assert.fail();
    })
    .catch(()=>{
      assert.ok(true);
    });
  });

  it("does not call spawn on devMode", ()=>{
    mock(platform, "spawn").resolveWith(0);
    mock(platform, "isDevMode").returnWith(true);
    
    return checker.checkSitesWithJava()
    .then(()=>{
      assert(!platform.spawn.called);
    })
    .catch(()=>{
      assert.ok(false);
    });
  });

  it("checks for java connectivity to sites", ()=>{
    mock(platform, "spawn").resolveWith(0);
    mock(platform, "isDevMode").returnWith(false);
    
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
    mock(platform, "isDevMode").returnWith(false);

    return checker.checkSitesWithJava(0)
    .then(()=>{
      assert.ok(false);
    })
    .catch((err)=>{
      assert.equal(err.message, 1);
    });
  });
});
