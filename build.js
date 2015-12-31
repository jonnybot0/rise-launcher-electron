var execSync= require("child_process").execSync,
fs = require("fs"),
path = require("path"),
zlib = require("zlib"),
tar = require("tar-fs"),
packager = require("electron-packager");

var packageOpts = {
  dir: ".",
  name: "installer",
  platform: "linux,win32",
  arch: "all",
  version: "0.36.1",
  ignore: ".git|builds|^test",
  out: "builds",
  overwrite: "true"
};

(function updateVersionNumber() {
  var d = new Date(),
  dateString = d.getUTCFullYear() + "." + (d.getUTCMonth() + 1) + "." +
  d.getUTCDate() + "." + d.getUTCHours() + "." + d.getUTCMinutes();

  console.log("Setting version to " + dateString);
  fs.writeFileSync("./version.json", JSON.stringify(dateString));

  ["lnx-32", "lnx-64", "win-32", "win-64"].forEach((suff)=>{
    var fileName = "./cfg/electron-remote-components-" + suff + ".json",
    componentSet = require(fileName);

    componentSet.InstallerElectronVersion = require("./version.json");
    fs.writeFileSync(fileName, JSON.stringify(componentSet, null, 2));
  });
}());

console.log("Generating builds");

packager(packageOpts, function done (err) {
  if(!err) {
    console.log("Builds generated");

    zipBuilds()
    .then(()=>{
      console.log("Done zipping builds");

      createSelfExtractingInstallers();
      console.log("Done generating self extracting installers");
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

  console.log("Zipping builds");
  
  return artifacts.reduce((prev, art)=>{
    return prev.then(()=>{
      return zipBuild(art[0], art[1]);
    });
  }, Promise.resolve());
}

function zipBuild(platform, zipName) {
  var input = path.join(__dirname, "builds", "installer-" + platform);
  var outputTar = path.join(__dirname, "builds", "rvplayer-installer-" + zipName + ".tar");
  var outputGz = path.join(__dirname, "builds", "rvplayer-installer-" + zipName + ".tar.gz");

  console.log("Zipping " + platform);

  return tarFolder(platform, zipName)
  .then(()=>{
    return gzipTar(zipName);
  })
  .then(()=>{
    fs.unlinkSync(outputTar);
  });

  function tarFolder() {
    return new Promise((resolve, reject)=>{
      tar.pack(input)
      .pipe(fs.createWriteStream(outputTar))
      .on("close", resolve)
      .on("error", reject);
    });
  }

  function gzipTar() {
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

function createSelfExtractingInstallers() {
  console.log("Generating self extracting installers");

  createLinux("linux-ia32", "lnx-32");
  createLinux("linux-x64", "lnx-64");
  createWindows("win32-ia32", "win-32");
  createWindows("win32-x64", "win-64");

  function createLinux(platform, fileName) {
    console.log("Generating self extracting installer for " + platform);
    execSync("makeself builds/installer-" + platform + "/ builds/installer-" + fileName + ".sh \"Rise Player\" ./resources/app/initial-run.sh");
  }

  function createWindows(platform, fileName) {
    var configFileData =
    ";!@Install@!UTF-8!" + "\n" +
    "Title=\"Rise Vision Player\"" + "\n" +
    "RunProgram=\"installer.exe\"" + "\n" +
    ";!@InstallEnd@!" + "\n";

    console.log("Writing config file for " + platform);
    fs.writeFileSync("builds/config.txt", configFileData);
    console.log("Generating 7zip file for " + platform);
    execSync("cd builds/installer-" + platform + " && 7z a -mx4 ../installer-" + platform + ".7z *");
    console.log("Generating self extracting installer for " + platform);
    execSync("cat external-deps/win-sfx/7zS.sfx builds/config.txt builds/installer-" + platform + ".7z > builds/installer-" + fileName + ".exe");
  }
}
