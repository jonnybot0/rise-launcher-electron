module.exports = (platform)=>{
  return {
    validatePlatform() {
      return ["win32", "linux"].indexOf(platform.getOS()) !== -1;
    },
    validateOS() {
      var osVer;

      if (platform.getOS() === "win32") {return true;}

      osVer = platform.getUbuntuVer();

      if (!osVer) {
        log.all("Could not determine os release.");
        return false;
      }

      if (osVer.toString() != "14.04") {
        log.all("Ubuntu 14.04 is required.");
        return false;
      }
      return true;
    }
  };
};
