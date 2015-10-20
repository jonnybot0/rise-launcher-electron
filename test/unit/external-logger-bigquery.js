var assert = require("assert"),
mock = require("simple-mock"),
extlogger;

describe("external logger bigquery", function() {
  it("exists", function() {
    extlogger = require("../../logger/bigquery/external-logger-bigquery.js")();
    assert.ok(extlogger);
  });

  it("makes the post call", function() {
    var stub = mock.stub()
    .resolveWith({json() {return Promise.resolve({access_token: "test-token"});}})
    .resolveWith({});
    extlogger = require("../../logger/bigquery/external-logger-bigquery.js")
    ({httpFetch: stub});

    return extlogger.log("testEvent", "testId", "testVersion", "testDetails")
    .then(()=>{
      assert.ok(/datasets\/Installer_Events/.test(stub.lastCall.args[0]));
      assert.ok(/tables\/events[0-9]{8}/.test(stub.lastCall.args[0]));
      assert.ok(stub.lastCall.args[1].headers.Authorization === "Bearer test-token");
      assert.ok(JSON.parse(stub.lastCall.args[1].body).rows[0].json.event === "testEvent");
    });
  });

  it("doesn't refresh token if called recently", function() {
    var stub = mock.stub()
    .resolveWith({json() {return Promise.resolve({access_token: "test-token"});}})
    .resolveWith({});
    extlogger = require("../../logger/bigquery/external-logger-bigquery.js")
    ({httpFetch: stub});

    return extlogger.log("testEvent", "testId", "testVersion", "testDetails")
    .then(()=>{
      return extlogger.log("testEvent", "testId", "testVersion", "testDetails")
    }).then(()=>{
      assert.equal(stub.callCount, 3);
    });;
  });

  it("refreshes token if not called recently", function() {
    var stub = mock.stub()
    .resolveWith({json() {return Promise.resolve({access_token: "test-token"});}})
    .resolveWith({});
    extlogger = require("../../logger/bigquery/external-logger-bigquery.js")
    ({httpFetch: stub});

    var now= new Date();
    var hourAhead = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, now.getMinutes(), now.getSeconds());

    return extlogger.log("testEvent", "testId", "testVersion", "testDetails")
    .then(()=>{
      return extlogger.log("test2", "testId", "testVer", "testDet", hourAhead);
    }).then(()=>{
      assert.equal(stub.callCount, 4);
    });;
  });
});
