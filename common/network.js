var fetch = require("node-fetch"),
http = require("http"),
urlParse = require("url").parse,
pathSep = require("path").sep;

module.exports = {
  httpFetch: function(dest, opts) {
    return fetch(dest, opts);
  },

  downloadFile(url) {
    return new Promise((resolve, reject)=>{
      var path = pathJoin(platform.getTempDir(), urlParse(url).pathname.split(pathSep).pop()),
      file = fs.createWriteStream(path);
      
      http.get(url, (res)=>{
        res.on("data", (data)=>{
          file.write(data);
        });
        res.on("end", ()=>{
          file.end();
          resolve(path);
        });
      })
      .on("error", function(e) {
        file.end();
        reject({ message: "Error downloading file" + e.message, error: e });
      });
    });
  }
};
