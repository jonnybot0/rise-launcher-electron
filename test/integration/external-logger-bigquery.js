"use strict";
var assert = require("assert"),
extlogger = require("../../logger/bigquery/external-logger-bigquery.js")
(require("../../common/network.js"));

global.log = require("../../logger/logger.js")();

describe("external logger bigquery", function() {
  it("logs to bigquery", function() {
    return extlogger.log("testEvent", "testId", "testVersion", "testDetails")
    .then(resp=>{
      return resp.json();
    })
    .then(json=>{
      assert.ok(json.kind === "bigquery#tableDataInsertAllResponse");
    });
  });
});
