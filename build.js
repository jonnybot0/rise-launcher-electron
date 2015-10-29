var spawn= require("child_process").spawn,
fs = require("fs"),
archiver = require("archiver"),
path = require("path"),
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

packager(opts, function done (err, appPath) {
  if(!err) {
    console.log("Done. Zipping builds.");
    zipBuilds();
  }
  else {
    console.log("Errors during build: ", err);
  }
});

function zipBuilds() {
  console.log("zipping builds");
  zipBuild("linux-ia32", "lnx-32");
  zipBuild("linux-x64", "lnx-64");
  zipBuild("win32-ia32", "win-32");
  zipBuild("win32-x64", "win-64");

  function zipBuild(platform, zipName) {
    var output = fs.createWriteStream(path.join(__dirname, "builds", "rvplayer-installer-" + zipName + ".zip")),
    archive = archiver("zip");

    output.on("close", function() {
      console.log("archiver finalized " + platform);
    });

    archive.on("error", function(err) {
        throw err;
    });

    archive.pipe(output);

    archive
    .directory(path.join(__dirname, "builds", "installer-" + platform), "Installer")
    .finalize();
  }
}
