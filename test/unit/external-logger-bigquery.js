var assert = require("assert"),
mock = require("simple-mock"),
extlogger;

describe("external logger bigquery", function() {
  it("exists", function() {
    extlogger = require("../../logger/external-logger-bigquery.js")();
    assert.ok(extlogger);
  });

  it("makes the post call", function() {
    var stub = mock.stub()
    .resolveWith({JSON() {return Promise.resolve({access_token: "test-token"});}})
    .resolveWith({});
    extlogger = require("../../logger/external-logger-bigquery.js")({fetch: stub});

    return extlogger.log("testEvent", "testId", "testVersion", "testDetails")
    .then(()=>{
      var authHeader = "Authorization: Bearer test-token";
      assert.ok(/datasets\/Installer_Events/.test(stub.lastCall.args[0]));
      assert.ok(/tables\/events[0-9]{8}/.test(stub.lastCall.args[0]));
      assert.ok(stub.lastCall.args[1].headers.indexOf(authHeader) !== -1);
      assert.ok(JSON.parse(stub.lastCall.args[1].body).rows[0].json.event === "testEvent");
    });
  });
});
