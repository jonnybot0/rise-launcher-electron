module.exports = (network)=>{
  var EXTERNAL_LOGGER_SERVICE_URL = "https://www.googleapis.com/bigquery/v2/projects/client-side-events/datasets/Installer_Events/tables/TABLE_ID/insertAll";

  var EXTERNAL_LOGGER_REFRESH_URL = "https://www.googleapis.com/oauth2/v3/token?client_id=1088527147109-6q1o2vtihn34292pjt4ckhmhck0rk0o7.apps.googleusercontent.com&client_secret=nlZyrcPLg6oEwO9f9Wfn29Wh&refresh_token=1/xzt4kwzE1H7W9VnKB8cAaCx6zb4Es4nKEoqaYHdTD15IgOrJDtdun6zK6XiATCKT&grant_type=refresh_token";

  var EXTERNAL_LOGGER_INSERT_SCHEMA = {
    "kind": "bigquery#tableDataInsertAllRequest",
    "skipInvalidRows": false,
    "ignoreUnknownValues": false,
    "rows": [
      {
        "insertId": "",
        "json": {
          "event": "",
          "display_id": "",
          "installer_version": "",
          "event_details": "",
          "ts": 0
        }
      }
    ]
  };

  var EXTERNAL_LOGGER_REFRESH_DATE = 0;
  var EXTERNAL_LOGGER_TOKEN = "";

  function getDateForTableName() {
    var date = new Date(),
    year = date.getUTCFullYear(),
    month = date.getUTCMonth() + 1,
    day = date.getUTCDate();

    if (month < 10) {month = "0" + month;}
    if (day < 10) {day = "0" + day;}

    return "" + year + month + day;
  }

  function refreshToken() {
    if (new Date() - EXTERNAL_LOGGER_REFRESH_DATE < 3580000) {
      return Promise.resolve(EXTERNAL_LOGGER_TOKEN);
    }
    return network.fetch(EXTERNAL_LOGGER_REFRESH_URL, {method: "POST"})
    .then(resp=>{return resp.JSON();})
    .then(json=>{return {token: json.access_token, refreshedAt: new Date()};});
  }

  return {
    log(eventName, displayId, version, eventDetails) {
      if (!eventName) {return;}

      return refreshToken().then((refreshData)=>{
        var insertData = JSON.parse(JSON.stringify(EXTERNAL_LOGGER_INSERT_SCHEMA)),
        serviceUrl,
        headers; 

        serviceUrl = EXTERNAL_LOGGER_SERVICE_URL.replace
        ("TABLE_ID", "events" + getDateForTableName());

        EXTERNAL_LOGGER_REFRESH_DATE = refreshData.refreshedAt || EXTERNAL_LOGGER_REFRESH_DATE;
        EXTERNAL_LOGGER_TOKEN = refreshData.token || EXTERNAL_LOGGER_TOKEN;
        headers = [
          "Content-Type: application/json",
          "Authorization: Bearer " + EXTERNAL_LOGGER_TOKEN
        ];

        insertData.rows[0].insertId = Math.random().toString(36).substr(2).toUpperCase();
        insertData.rows[0].json.event = eventName;
        insertData.rows[0].json.display_id = displayId;
        insertData.rows[0].json.installer_version = version;
        if (eventDetails) {insertData.rows[0].json.event_details = eventDetails;}
        insertData.rows[0].json.ts = new Date().toISOString();
        insertData = JSON.stringify(insertData);
        return network.fetch(serviceUrl, {
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
