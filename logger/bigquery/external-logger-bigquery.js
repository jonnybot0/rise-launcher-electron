module.exports = (network, platform)=>{
  var config = require("./config.json"),
  refreshDate = 0,
  token = "",
  displaySettings = {},
  os = platform.getOS() + " " + platform.getArch(),
  installerVersion = require("../../version.json");

  function getDateForTableName(nowDate) {
    var date = nowDate,
    year = nowDate.getUTCFullYear(),
    month = nowDate.getUTCMonth() + 1,
    day = nowDate.getUTCDate();

    if (month < 10) {month = "0" + month;}
    if (day < 10) {day = "0" + day;}

    return "" + year + month + day;
  }

  function refreshToken(nowDate) {
    if (nowDate - refreshDate < 3580000) {
      return Promise.resolve(token);
    }

    return network.httpFetch(config.refreshUrl, {method: "POST"})
    .then(resp=>{return resp.json();})
    .then(json=>{
      refreshDate = nowDate;
      token = json.access_token;
    });
  }

  var mod = {
    getDateForTableName,
    refreshToken,
    setDisplaySettings(settings) {
      displaySettings = settings;
    },
    log(eventName, eventDetails, nowDate) {
      if (!eventName) {return Promise.reject("eventName is required");}
      if (!nowDate || !Date.prototype.isPrototypeOf(nowDate)) {
        nowDate = new Date();
      }

      return mod.refreshToken(nowDate).then(()=>{
        var insertData = JSON.parse(JSON.stringify(config.insertSchema)),
        serviceUrl,
        headers; 

        serviceUrl = config.serviceUrl.replace
        ("TABLE_ID", "events" + mod.getDateForTableName(nowDate));

        headers = {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        };

        insertData.rows[0].insertId = Math.random().toString(36).substr(2).toUpperCase();
        insertData.rows[0].json.event = eventName;
        insertData.rows[0].json.display_id = displaySettings.displayid;
        insertData.rows[0].json.installer_version = installerVersion;
        insertData.rows[0].json.os = os;
        if (eventDetails) {insertData.rows[0].json.event_details = eventDetails;}
        insertData.rows[0].json.ts = nowDate.toISOString();
        insertData = JSON.stringify(insertData);
        return network.httpFetch(serviceUrl, {
          method: "POST",
          headers,
          body: insertData
        });
      })
      .catch(e=>{
        log.file("Could not log to bq", e);
      });
    }
  };

  return mod;
};
