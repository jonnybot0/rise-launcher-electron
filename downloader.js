var fs = require("fs"),
http = require("http"),
urlParse = require("url").parse,
pathSep = require("path").sep,
pathJoin = require("path").join,
componentsUrl = "http://storage.googleapis.com/install-versions.risevision.com/remote-components-platform-arch.cfg",
admzip = require("adm-zip"),
arch = process.platform.arch;

if (process.platform === "linux") {
  componentsUrl = componentsUrl.replace("platform", "lnx");
  componentsUrl = componentsUrl.replace("arch", arch === "x64" ? "64" : "32");
} else {
  componentsUrl = componentsUrl.replace("platform", "win");
  componentsUrl = componentsUrl.replace("-arch", "");
}

module.exports = {
  getComponentsList() {
    return new Promise((resolve, reject)=>{
      var componentsList = "";
      console.log("fetching components from " + componentsUrl);
      http.get(componentsUrl, (res)=>{
        res.on("data", (data)=>{
          componentsList += data;
          console.log("data received");
        });
        res.on("end", ()=>{resolve(componentsList);});
        res.on("error", (error)=>{
          console.log(error);
          reject(error);
        });
      });
    });
  },
  parseComponentsList(list) {
    var result = {};
    list.split(require("os").EOL).forEach((line)=>{
      var vals = line.split("=");
      result[vals[0]] = vals[1];
    });

    return result;
  },
  downloadFile(url) {
    return new Promise((resolve, reject)=>{
      var path = pathJoin(__dirname, urlParse(url).pathname.split(pathSep).pop()),
      file = fs.createWriteStream(path);

      console.log("saving to " + path);
      http.get(url, (res)=>{
        res.on("data", (data)=>{
          file.write(data);
        });
        res.on("end", ()=>{
          file.end();
          if (require("path").extname(path).toUpperCase() === ".ZIP") {
            return resolve(unzipFile(path));
          }
          resolve();
        });
      });
    });

    function unzipFile(path) {
      return new Promise((resolve, reject)=>{
        console.log("unzipping " + path);
        var zip = new admzip(path);
        zip.extractAllTo(__dirname, true);
        resolve();
      });
    }
  }
};
