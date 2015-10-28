var platform = require("./platform.js"),
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
      file = fs.createWriteStream(tempPath);  

      file.on("error", (err)=>{
        reject({ message: "Error creating temporary download file", error: err });
      });

      http.get(url, (res)=>{
        if(res.statusCode === 404) {
          reject({ message: "File not found", error: res.statusCode });
        }
        else if(res.statusCode < 200 || res.statusCode >= 300) {
          reject({ message: "Error downloading file", error: res.statusCode });
        }

        res.on("data", (data)=>{
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
      })
      .on("error", function(e) {
        file.end();
        reject({ message: "Request error downloading file" + e.message, error: e });
      });
    });
  }
};
