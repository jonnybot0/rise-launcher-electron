var spawn= require("child_process").spawn,
fs = require("fs"),
archiver = require("archiver"),
path = require("path");

packager = spawn("./node_modules/.bin/electron-packager", [".", "installer", "--platform=linux,win32", "--arch=all", "--version=0.33.6", "--ignore=\".git|node_modules/(?!adm-zip)|builds|test\"", "--out=builds", "--overwrite"], {encoding: "utf8", stdio: "inherit"});

packager.on("close", zipBuilds);

function zipBuilds() {
  console.log("zipping builds");
  zipBuild("linux-x64");
  zipBuild("win32-x64");

  function zipBuild(platform) {
    var output = fs.createWriteStream(path.join(__dirname, "builds", "installer-" + platform + ".zip")),
    archive = archiver("zip");

    output.on("close", function() {
      console.log("archiver finalized " + platform);
    });

    archive.on("error", function(err) {
        throw err;
    });

    archive.pipe(output);

    archive
    .directory(path.join(__dirname, "builds", "installer-" + platform), "installer-" + platform)
    .finalize();
  }
}
