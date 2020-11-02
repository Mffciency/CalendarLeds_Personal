// tutorial: https://www.youtube.com/watch?v=zrLf4KMs71E

const{google} = require('googleapis')
const { oauth2 } = require('googleapis/build/src/apis/oauth2')

const {OAuth2} = google.auth

const clientId = require('./login.json').clientId;
const clientSecret = require('./login.json').clientSecret;
const refreshToken = require('./login.json').refreshToken;
const calId = require('./login.json').PriveCalendar;



const oAuth2Client = new OAuth2(clientId,clientSecret)

oAuth2Client.setCredentials({refresh_token:refreshToken})

const calendar = google.calendar({version : 'v3', auth: oAuth2Client})

function getCalendars() {
    return calendar.calendarList.list({
      
    })
        .then(function(response) {
                // Handle the results here (response.result has the parsed body).
                // console.log("Response", response);
                const calitems = response.data.items;
                calitems.forEach(element => {
                    console.log(element)
                });

              },
              function(err) { console.error("Execute error", err); });
  }

  function execute() {
    const start = new Date();
    start.setHours(0,0,0,0);

    const end = new Date();
    // end.setHours(23,59,59,999);

    return calendar.events.list({
      "calendarId": calId,
      "alwaysIncludeEmail": false,
      "maxResults": 25,
      "orderBy": "startTime",
      "showDeleted": false,
      "singleEvents": true,
      "timeMax": end,
      "timeMin": start,
      "timeZone": "Europe/Zurich"
    })
        .then(function(response) {
                // Handle the results here (response.result has the parsed body).
                const evitems = response.data.items;
                evitems.forEach(element => {
                    console.log("start: ",element.start.dateTime)
                });
                

                console.log(start,end)
              },
              function(err) { console.error("Execute error", err); });
  }
// async function main(){
//     const ids = await calendar.calendarList.list(

//     )
//     // const ids = calendar.calendars.get({calendarId:"1"})
    
//     console.log("test")
//     console.log(ids.items)
// }

// main()
execute()