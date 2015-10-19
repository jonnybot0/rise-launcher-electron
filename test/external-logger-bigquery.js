var assert = require("assert"),
mock = require("simple-mock"),
logger;

describe("external logger bigquery", function() {
  it("exists", function() {
    logger = require("../logger/external-logger-bigquery.js")();
    assert.ok(logger);
  });

  it("makes the post call", function() {
    var stub = mock.stub()
    .resolveWith({JSON() {return Promise.resolve({access_token: "test-token"});}})
    .resolveWith({});
    logger = require("../logger/external-logger-bigquery.js")({fetch: stub});

    return logger.logExternal("testEvent", "testId", "testVersion", "testDetails")
    .then(()=>{
      console.dir(stub.lastCall);
      var authHeader = "Authorization: Bearer test-token";
      assert.ok(/datasets\/Installer_Events/.test(stub.lastCall.args[0]));
      assert.ok(/tables\/events[0-9]{8}/.test(stub.lastCall.args[0]));
      assert.ok(stub.lastCall.args[1].headers.indexOf(authHeader) !== -1);
      assert.ok(JSON.parse(stub.lastCall.args[1].body).rows[0].json.event === "testEvent");
    });
  });
});
