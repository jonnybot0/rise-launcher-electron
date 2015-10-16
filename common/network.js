var fetch = require("node-fetch");

module.exports = {
  httpFetch: function(dest, opts) {
    if (!opts) {
      return fetch(dest);
    }

    setHeaders();
    return fetch(dest, opts);

    function setHeaders() {
      var headerArray = opts.headers,
      headers;

      if (!headerArray) {return;}

      headers = new Headers();

      headerArray.forEach(function(header) {
        var nameValue = header.split(":");
        headers.append(nameValue[0], nameValue[1].replace(" ", ""));
      });

      opts.headers = headers;
    }
  }
};
