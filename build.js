var spawnSync= require("child_process").spawnSync,
execSync= require("child_process").execSync,
fs = require("fs"),
path = require("path"),
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

  //["linux-ia32", "lnx-32"], ["linux-x64", "lnx-64"], ["win32-ia32", "win-32"], ["win32-x64", "win-64"]
  createWindows("win32-ia32", "win-32");
  createWindows("win32-x64", "win-64");

  function createWindows(platform, fileName) {
    var configFileData =
    ";!@Install@!UTF-8!" + "\n" +
    "Title=\"Rise Vision Player\"" + "\n" +
    "BeginPrompt=\"Do you want to install Rise Vision Player?\"" + "\n" +
    "Directory=\"\"" +  "\n" +
    "RunProgram=\"builds\\installer-" + platform + "\\installer.exe\"" + "\n" +
    ";!@InstallEnd@!" + "\n";

    console.log("Writing config file for " + platform);
    fs.writeFileSync("builds/config.txt", configFileData);
    console.log("Generating 7zip file for " + platform);
    execSync("7z a -mx4 builds/installer-" + platform + ".7z builds/installer-" + platform + "/*");
    console.log("Generating self extracting installer for " + platform);
    execSync("cat external-deps/7zS.sfx builds/config.txt builds/installer-" + platform + ".7z > builds/installer-" + fileName + ".exe");
  }
}
