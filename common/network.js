var platform = require("./platform.js"),
fetch = require("node-fetch"),
http = require("http"),
proxyAgent = require("http-proxy-agent"),
proxy = require("./proxy.js"),
fetchOptions = {},
urlParse = require("url").parse,
path = require("path"),
fs = require("fs");

proxy.observe(handleProxyChange);
function handleProxyChange(fields) {
  log.debug("Setting proxy to " + fields.href);
  fetchOptions.agent = new proxyAgent(fields.href);
}

module.exports = {
  httpFetch(dest, opts) {
    if (!opts) {opts = fetchOptions;}
    if (!opts.agent && fetchOptions.agent) {opts.agent = fetchOptions.agent;}

    return module.exports.callFetch(dest, opts);
  },
  callFetch(dest, opts) {
    return fetch(dest, opts);
  },
  downloadFile(url) {
    return new Promise((resolve, reject)=>{
      var tempPath = path.join(platform.getTempDir(), urlParse(url).pathname.split(path.sep).pop()),
      file = fs.createWriteStream(tempPath),
      fileName = urlParse(url).pathname,
      progress = 0;

      file.on("error", (err)=>{
        reject({ message: "Error creating temporary download file", error: err });
      });

      log.debug("Downloading " + url);
      log.ui(progress, fileName);

      var req = http.get(url, (res)=>{
        if(res.statusCode === 404) {
          reject({ message: "File not found", error: res.statusCode });
        }
        else if(res.statusCode < 200 || res.statusCode >= 300) {
          reject({ message: "Error downloading file", error: res.statusCode });
        }

        res.on("data", (data)=>{
          progress += data.length;
          log.ui(progress, fileName);
          file.write(data);
        });
        res.on("end", ()=>{
          file.end();
          resolve(tempPath);
        });
        res.on("error", function(e) {
          file.end();
          reject({ message: "Response error downloading file" + e.message, error: e });
        });
      });

      req.on("socket", function (socket) {
        socket.setTimeout(2000);  
        socket.on("timeout", function() {
          if(!progress) {
            req.abort();
            reject({ message: "Request timed out", error: url });
          }
        });
      });

      req.on("error", function(e) {
        file.end();
        reject({ message: "Request error downloading file" + e.message, error: e });
      });
    });
  }
};
