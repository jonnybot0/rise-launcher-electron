var assert = require("assert"),
mock = require("simple-mock"),
extlogger,
fetchStub,
osStub,
archStub;

describe("external logger bigquery", function() {
  beforeEach("setup", ()=> {
    fetchStub = mock.stub()
    .resolveWith({json() {return Promise.resolve({access_token: "test-token"});}})
    .resolveWith({});
    osStub = mock.stub().returnWith("");
    archStub = mock.stub().returnWith("");

    extlogger = require("../../logger/bigquery/external-logger-bigquery.js")
    ({httpFetch: fetchStub}, {getOS: osStub, getArch: archStub});
  });

  it("exists", function() {
    assert.ok(extlogger);
  });

  it("makes the post call", function() {
    return extlogger.log("testEvent", "testDetails")
    .then(()=>{
      assert.ok(/datasets\/Installer_Events/.test(fetchStub.lastCall.args[0]));
      assert.ok(/tables\/events[0-9]{8}/.test(fetchStub.lastCall.args[0]));
      assert.ok(fetchStub.lastCall.args[1].headers.Authorization === "Bearer test-token");
      assert.ok(JSON.parse(fetchStub.lastCall.args[1].body).rows[0].json.event === "testEvent");
    });
  });

  it("doesn't refresh token if called recently", function() {
    return extlogger.log("testEvent", "testDetails")
    .then(()=>{
      return extlogger.log("testEvent", "testDetails")
    }).then(()=>{
      assert.equal(fetchStub.callCount, 3);
    });;
  });

  it("refreshes token if not called recently", function() {
    var now= new Date();
    var hourAhead = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, now.getMinutes(), now.getSeconds());

    return extlogger.log("testEvent", "testDetails")
    .then(()=>{
      return extlogger.log("test2", "testDet", hourAhead);
    }).then(()=>{
      assert.equal(fetchStub.callCount, 4);
    });;
  });
});
