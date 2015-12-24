var spawnSync= require("child_process").spawnSync,
execSync= require("child_process").execSync,
fs = require("fs"),
path = require("path"),
zlib = require("zlib"),
tar = require("tar-fs"),
rimraf = require("rimraf"),
packager = require("electron-packager");

var opts = {
  dir: ".",
  name: "installer",
  platform: "linux,win32",
  arch: "all",
  version: "0.36.1",
  ignore: ".git|builds|^test",
  out: "builds",
  overwrite: "true"
};

spawnSync("npm", ["install"], {stdio: "inherit", encoding: "utf8"});

console.log("Generating builds");

packager(opts, function done (err, appPath) {
  if(!err) {
    console.log("Builds generated");

    removeUnwantedDirs()
    .then(zipBuilds)
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

function removeUnwantedDirs() {
  var artifacts = ["linux-ia32", "linux-x64", "win32-ia32", "win32-x64"];

  return Promise.all(artifacts.map((platform)=>{
    return removeNodeModule(platform, "istanbul");
  }));

  function removeNodeModule(platform, name) {
    return removeDir(path.join("builds", "installer-" + platform, "resources", "app", "node_modules", name));
  }

  function removeDir(path) {
    return new Promise((resolve, reject)=>{
      rimraf(path, (err)=>{
        if(!err) {
          resolve();
        }
        else {
          reject({ message: "Error recursively deleting path", error: err });
        }
      });
    });
  }
}

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
  var resources = path.join(input, "resources");
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
    execSync("cat external-deps/7zS.sfx builds/config.txt builds/installer-" + platform + ".7z > builds/installer-" + fileName + ".exe");
  }
}
