var fetch = require("node-fetch");

module.exports = {
  httpFetch: function(dest, opts) {
    return fetch(dest, opts);
  }
};
