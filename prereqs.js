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
        log.error(messages.unknownOS);
        return false;
      }

      if (!Number(osVer.toString()) || Number(osVer.toString()) < 14.04) {
        log.all("Ubuntu 14.04 or later is required.");
        return false;
      }
      return true;
    }
  };
};
