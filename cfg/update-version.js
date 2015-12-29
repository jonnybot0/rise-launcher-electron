["lnx-32", "lnx-64", "win-32", "win-64"].forEach((suff)=>{
  var fileName = "./electron-remote-components-" + suff + ".json",
  componentSet = require(fileName);

  componentSet.InstallerElectronVersion = require("../version.json");
  require("fs").writeFileSync(fileName, JSON.stringify(componentSet, null, 2));
});
