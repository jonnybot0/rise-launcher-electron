var platform = require("./platform.js"),
fetch = require("node-fetch"),
http = require("http"),
proxyAgent = require("http-proxy-agent"),
proxy = require("./proxy.js"),
fetchOptions = {},
urlParse = require("url").parse,
path = require("path"),
fs = require("fs"),
downloadStats = {},
observers = [];

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
    downloadStats[url] = {tries: 0, bytesExpected: 0, bytesReceived: 0};

    function tryDownload(resolve, reject) {
      var tempPath = path.join(platform.getTempDir(), urlParse(url).pathname.split(path.sep).pop()),
      file = fs.createWriteStream(tempPath),
      fileName = urlParse(url).pathname;

      downloadStats[url].tries += 1;

      file.on("error", (err)=>{
        reject({ message: "Error creating temporary download file", error: err });
      });

      log.debug("Downloading " + url + " try " + downloadStats[url].tries);

      var req = http.get(url, (res)=>{
        if(res.statusCode === 404) {
          reject({ message: "File not found", error: res.statusCode });
        }
        else if(res.statusCode < 200 || res.statusCode >= 300) {
          reject({ message: "Error downloading file", error: res.statusCode });
        }

        downloadStats[url].bytesExpected = Number(res.headers["content-length"]);
        res.on("data", (data)=>{
          downloadStats[url].bytesReceived += data.length;
          file.write(data);
          observers.forEach((observer)=>{observer(downloadStats);});
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
          if(!downloadStats[url].bytesReceived) {
            req.abort();
            if (downloadStats[url].tries === 3) {
              reject({ message: "Request timed out", error: url });
            } else {
              tryDownload(resolve, reject);
            }
          }
        });
      });

      req.on("error", function(e) {
        file.end();
        reject({ message: "Request error downloading file" + e.message, error: e });
      });
    }

    return new Promise(tryDownload);
  },
  registerObserver(fn) {
    observers.push(fn);
  }
};
