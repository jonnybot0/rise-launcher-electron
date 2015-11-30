var urlParse = require("url").parse,
proxyFields = Object.create(null),
observers = [];

module.exports = {
  setEndpoint(endpoint) {
    var newFields;
    if (!endpoint) {return;}
    if (endpoint.substring(0,4) !== "http") {endpoint = "http://" + endpoint;}

    log.all("proxy", endpoint);
    newFields = urlParse(endpoint);
    Object.keys(newFields).forEach((key)=>{
      proxyFields[key] = newFields[key];
    });

    observers.forEach((fn)=>{fn(proxyFields);});
  },
  observe(cb) {
    observers.push(cb);
  },
  proxyFields
};
