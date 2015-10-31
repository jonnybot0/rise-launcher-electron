var spawnSync= require("child_process").spawnSync,
fs = require("fs"),
archiver = require("archiver"),
path = require("path"),
gunzip = require("gunzip-maybe"),
zlib = require("zlib"),
tar = require("tar-fs"),
packager = require("electron-packager");

var opts = {
  dir: ".",
  name: "installer",
  platform: "linux,win32",
  arch: "all",
  version: "0.33.9",
  ignore: ".git|builds|test",
  out: "builds",
  overwrite: "true"
};

spawnSync("npm", ["install"], {stdio: "inherit", encoding: "utf8"});

console.log("Generating builds");

packager(opts, function done (err, appPath) {
  if(!err) {
    console.log("Builds generated");

    zipBuilds().then(()=>{
      console.log("Done zipping builds");
    })
    .catch((err)=>{
      console.log("Error zipping builds", err);
    });
  }
  else {
    console.log("Errors during build: ", err);
  }
});

function zipBuilds() {
  var artifacts = [["linux-ia32", "lnx-32"], ["linux-x64", "lnx-64"], ["win32-ia32", "win-32"], ["win32-x64", "win-64"]];
  //var artifacts = [["win32-x64", "win-64"]];

  console.log("Zipping builds");
  
  return artifacts.reduce((prev, art)=>{
    return prev.then(()=>{
      return zipBuild(art[0], art[1]);
    });
  }, Promise.resolve());
}

function zipBuild(platform, zipName) {
  var input = path.join(__dirname, "builds", "installer-" + platform);
  var resources = path.join(input, "resources");
  var outputTar = path.join(__dirname, "builds", "rvplayer-installer-" + zipName + ".tar");
  var outputGz = path.join(__dirname, "builds", "rvplayer-installer-" + zipName + ".tar.gz");

  console.log("Zipping " + platform);

  return renameFile(path.join(resources, "atom.asar"), path.join(resources, "atom.ren"))
  .then(()=>{
    return tarFolder(platform, zipName);
  })
  .then(()=>{
    return gzipTar(zipName);
  })
  .then(()=>{
    fs.unlinkSync(outputTar);
  });

  function renameFile(oldName, newName) {
    return new Promise((resolve, reject)=>{
      fs.rename(oldName, newName, (err)=>{
        if(!err) {
          resolve();
        }
        else {
          reject({ message: "Error renaming file", error: err });
        }
      });
    });
  }

  function tarFolder(platform, zipName) {
    return new Promise((resolve, reject)=>{
      tar.pack(input)
      .pipe(fs.createWriteStream(outputTar))
      .on("close", resolve)
      .on("error", reject);
    });
  }

  function gzipTar(zipName) {
    var input = fs.createReadStream(outputTar);
    var output = fs.createWriteStream(outputGz);

    return new Promise((resolve, reject)=>{
      input
      .pipe(zlib.createGzip())
      .pipe(output)
      .on("close", resolve)
      .on("error", reject);
    });
  }
}
