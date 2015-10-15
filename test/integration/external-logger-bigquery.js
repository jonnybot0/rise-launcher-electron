"use strict";
var assert = require("assert"),
logger = require("../../logger/external-logger-bigquery.js")
(require("../../common/network.js"));

describe("external logger bigquery", function() {
  xit("logs to bigquery", function() {
    assert.ok(logger);
  });
});
