var platform = require("./platform.js"),
logger = require("../logger/logger.js")(),
fetch = require("node-fetch"),
http = require("http"),
urlParse = require("url").parse,
path = require("path"),
fs = require("fs");

module.exports = {
  httpFetch: function(dest, opts) {
    return fetch(dest, opts);
  },

  downloadFile(url) {
    return new Promise((resolve, reject)=>{
      var tempPath = path.join(platform.getTempDir(), urlParse(url).pathname.split(path.sep).pop()),
      file = fs.createWriteStream(tempPath),
      dataReceived = false;

      file.on("error", (err)=>{
        reject({ message: "Error creating temporary download file", error: err });
      });

      logger.debug("Downloading " + url);

      var req = http.get(url, (res)=>{
        if(res.statusCode === 404) {
          reject({ message: "File not found", error: res.statusCode });
        }
        else if(res.statusCode < 200 || res.statusCode >= 300) {
          reject({ message: "Error downloading file", error: res.statusCode });
        }

        res.on("data", (data)=>{
          dataReceived = true;
          
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
          if(!dataReceived) {
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
