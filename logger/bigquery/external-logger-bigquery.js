module.exports = (network)=>{
  var config = require("./config.json"),
  refreshDate = 0,
  token = "";

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

  return {
    log(eventName, displayId, version, eventDetails, nowDate) {
      if (!eventName) {return;}
      if (!nowDate || !Date.prototype.isPrototypeOf(nowDate)) {
        nowDate = new Date();
      }

      return refreshToken(nowDate).then(_=>{
        var insertData = JSON.parse(JSON.stringify(config.insertSchema)),
        serviceUrl,
        headers; 

        serviceUrl = config.serviceUrl.replace
        ("TABLE_ID", "events" + getDateForTableName(nowDate));

        headers = {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        };

        insertData.rows[0].insertId = Math.random().toString(36).substr(2).toUpperCase();
        insertData.rows[0].json.event = eventName;
        insertData.rows[0].json.display_id = displayId;
        insertData.rows[0].json.installer_version = version;
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
};
