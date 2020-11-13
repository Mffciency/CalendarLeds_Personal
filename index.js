/* calendar api tutorial: https://www.youtube.com/watch?v=zrLf4KMs71E

how does it work:
it reads your google calendar and returns for each led an RGB value

led #1 = 00:10 - 00:19 > this is so you can have a bright led at the end of the ledstrip indicating "the end of the day"
led #2 = 00:20 - 00:29
...
led #144 = 00:00 - 00:09 


TODO: 
- link between google source and github
- add more documentation
- cleanup code

*/

const { google } = require('googleapis')
const { oauth2 } = require('googleapis/build/src/apis/oauth2')

const { OAuth2 } = google.auth

const clientId = require('./login.json').clientId;
const clientSecret = require('./login.json').clientSecret;
const refreshToken = require('./login.json').refreshToken;
const calId = require('./login.json').PriveCalendar;
const calId2 = require('./login.json').am;
const calId3 = require('./login.json').ab;
const accessToken = require('./login.json').at;
const baseWebsite = require('./login.json').web;

/* for adding a new calendar, make sure:
- you update the login file in the google cloud environment
- you add exceptions to the overlayhours function

*/


const oAuth2Client = new OAuth2(clientId, clientSecret)

oAuth2Client.setCredentials({ refresh_token: refreshToken })

const calendar = google.calendar({ version: 'v3', auth: oAuth2Client })

// set up global variables
var hourmod = 0 // if your pc has a different timezone than the google cloud
var nrLeds = 144 // the amount of leds in your ledstrip
var baseColor = [0, 0, 0]//[0, 0, 0] // the background color
var hourColor = [0, 0, 0]//[4, 2, 8] // the color of the hour indications
var hour3Color = [0, 0, 0]//[12, 16, 12] // the color of the hours divisible by 3
var hour12Color = [0, 0, 0]//[30, 30, 30] // the color of the hours divisible by 12
var sleepColor = [0, 0, 0]//[0, 0, 0] // the color of the leds before 7hr and after 23hr
var nowColor = [0, 0, 0]//[0, 20, 0] // the color of the led indicating the current time
var appointmentColor = [0, 0, 0]//[4, 0, 16] // the color of the appointments of the first calendar
var amColor = [0, 0, 0]//[8, 8, 0] // the color of the appointments of the second calendar
var abColor = [0, 0, 0]//[0, 4, 8] // the color of the appointments of the third calendar
var pastDiv = 4.0 // you divide the brightness of the leds in the past by this amount
var refreshRate = 1.0 //de divider of the refreshrate of the arduino
var website = baseWebsite
var datatimes = []
var LedSequence = []
var showPrint = true;

Date.prototype.addHours = function (h) {
  this.setTime(this.getTime() + (h * 60 * 60 * 1000));
  return this;
}

function onSelfReset(){
  nrLeds = 144;
  baseColor = [0, 0, 0];
  hourColor = [0, 0, 0];
  hour3Color = [0, 0, 0];
  hour12Color = [0, 0, 0];
  sleepColor = [0, 0, 0];
  nowColor = [0, 0, 0];
  appointmentColor = [0, 0, 0];
  amColor = [0, 0, 0];
  abColor = [0, 0, 0];
  pastDiv = 4.0;
}

function updateVars() {
  var show = 0;
  console.log("updating vars")
  if (show) {
    console.log("before : nrLeds:", nrLeds, "baseColor:", baseColor, typeof baseColor, "hourColor:", hourColor, "hour3Color:", hour3Color, "hour12Color:", hour12Color, "sleepColor:", sleepColor, "nowColor:", nowColor, "appointmentColor:", appointmentColor, "amColor:", amColor, "pastDiv:", pastDiv)
  }
  nrLeds = process.env.nrLeds;
  baseColor = JSON.parse(process.env.baseColor);
  hourColor = JSON.parse(process.env.hourColor);
  hour3Color = JSON.parse(process.env.hour3Color);
  hour12Color = JSON.parse(process.env.hour12Color);
  sleepColor = JSON.parse(process.env.sleepColor);
  nowColor = JSON.parse(process.env.nowColor);
  appointmentColor = JSON.parse(process.env.appointmentColor);
  amColor = JSON.parse(process.env.amColor);
  abColor = JSON.parse(process.env.abColor);
  pastDiv = parseFloat(process.env.pastDiv);
  refreshRate = parseFloat(process.env.refreshRate);
  website = process.env.website;
  if (show) {
    console.log("before : nrLeds:", nrLeds, "baseColor:", baseColor, typeof baseColor, "hourColor:", hourColor, "hour3Color:", hour3Color, "hour12Color:", hour12Color, "sleepColor:", sleepColor, "nowColor:", nowColor, "appointmentColor:", appointmentColor, "amColor:", amColor, "pastDiv:", pastDiv)
  }

}

function print(text) {
  if (showPrint) {
    console.log(text);
  }

}

async function createBlank() {
  //empty ledsequence
  LedSequence = []

  // create an array with 144 unlit LEDs
  for (let index = 0; index < nrLeds; index++) {
    LedSequence.push([0, 0, 0])
  }
  // console.log("ledstart: ", LedSequence)
}

async function prep(calendarId) {
  // set start of today
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.addHours(hourmod);

  // set end of today
  const end = new Date();
  end.setHours(0, 1, 0, 0);
  end.addHours(24 + hourmod);

  const times = [];

  // get events of today
  return calendar.events.list({
    "calendarId": calendarId,
    "alwaysIncludeEmail": false,
    "maxResults": 25,
    "orderBy": "startTime",
    "showDeleted": false,
    "singleEvents": true,
    "timeMax": end,
    "timeMin": start,
    "timeZone": "Europe/Zurich"
  })
    .then(function (response) {
      // Handle the results here (response.result has the parsed body).
      const evitems = response.data.items;

      evitems.forEach(element => {
        if (element.start.dateTime) {
          // check if starttime and endtime are in the right order
          var startpos = timeToLedpos(calTime(element.start.dateTime), true);
          var endpos = timeToLedpos(calTime(element.end.dateTime));

          if (dateCheck(element.start.dateTime) == -1) {
            startpos = 0;
          }
          if (dateCheck(element.end.dateTime) == 1) {
            endpos = nrLeds;
          }


          times.push([startpos, endpos]);


          console.log("item name: ", element.summary)
          console.log("start: ", element.start.dateTime);
          // formatTime(element.start.dateTime);
        }
      });
      datatimes = times;
      console.log(datatimes);
    },
      function (err) {
        console.error("Execute error", err);
      });
}

function dateCheck(timeIn) {
  var date = Date.parse(timeIn);
  var start = new Date();
  start.setHours(0, 0, 0, 0);
  start.addHours(hourmod);

  // set end of today
  var end = new Date();
  end.setHours(0, 1, 0, 0);
  end.addHours(24 + hourmod);
  if (date < start) {
    return -1
  }
  else if (date > end) {
    return 1
  }
  else {
    return 0
  }


}

function calTime(timeIn) {
  //console.log("timein: ",timeIn)
  var hour = timeIn.substring(11, 13);
  //console.log("hour: ",hour)
  var min = timeIn.substring(14, 16);
  return [hour, min];
}

function timeToLedpos([hour, min], down = false) {
  // change the time into a position on the ledstrip
  //console.log("hour: ",hour,":", min)
  var deciMin = 0;
  if (down) {
    deciMin = Math.floor(min / 10);
  }
  else {
    deciMin = Math.ceil(min / 10);
  }

  var ledPos = hour * 6 + deciMin;
  // console.log("-----------------------")
  // console.log("info:")
  // console.log(hour, min, deciMin, ledPos);
  // console.log("-----------------------")
  return ledPos;
}

async function putAppointment(datetimesIn, color) {
  // pushing the appointements to the led array
  console.log("pushing appointments:")
  console.log("dates in:", datetimesIn, "color:", color)
  datetimesIn.forEach(element => {
    // console.log(element);
    for (let index = element[0]; index < element[1]; index++) {
      LedSequence[index] = color;
      // console.log(element);
    }
  });
  // console.log(LedSequence);
}

async function overlayHours() {
  // console.log("overlayingHours:")
  // console.log(LedSequence);
  for (let pos = 0; pos < nrLeds; pos++) {
    if (pos % 72 == 0) {
      // every 12 hour
      LedSequence[pos] = hour12Color;
    }
    else if (pos % 36 == 0) {
      // every 6 hour
      LedSequence[pos] = hour3Color;
    }
    else if (pos % 18 == 0) {
      // every 3 hour
      LedSequence[pos] = hour3Color;
    }
    else if (pos % 6 == 0) {
      // n is a multiple of 6 every hour
      LedSequence[pos] = hourColor;
    }
    else if (pos < 42) {
      // if sleeping
      if (LedSequence[pos] != appointmentColor && LedSequence[pos] != amColor && LedSequence[pos] != abColor) {
        LedSequence[pos] = sleepColor;
      }
    }
    else if (pos > 138) {
      // if sleeping
      if (LedSequence[pos] != appointmentColor && LedSequence[pos] != amColor && LedSequence[pos] != abColor) {
        LedSequence[pos] = sleepColor;
      }
    }
    else {
      // basecolor
      if (LedSequence[pos] != appointmentColor && LedSequence[pos] != amColor && LedSequence[pos] != abColor) {
        LedSequence[pos] = baseColor;
      }
    }
  }
  // console.log(LedSequence);
}

function addZero(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

async function dimPast() {
  console.log("dim past");
  // console.log(LedSequence);
  var now = new Date();
  now.addHours(1);
  var h = addZero(now.getHours());
  var m = addZero(now.getMinutes());
  //console.log(now.getHours(),now.getMinutes());
  console.log(now);
  const curPos = timeToLedpos([h, m], true);

  for (var pos = 0; pos <= curPos; pos++) {
    if (pos == curPos) {
      LedSequence[pos] = nowColor;
    }
    else {
      // console.log("ledpos", [pos]);
      // console.log("before:",LedSequence[pos]);
      //let newvar = [0,0,0]
      //console.log("newvar:",newvar);
      // console.log("ledpos:", LedSequence[pos][0], "div:", pastDiv);
      let newvar = [Math.round((LedSequence[pos][0]) / pastDiv), Math.round((LedSequence[pos][1]) / pastDiv), Math.round((LedSequence[pos][2]) / pastDiv)];
      // console.log("newvar:",newvar);
      LedSequence[pos] = newvar;
      // console.log("after: ",LedSequence[pos]);
      // console.log("");
    }
  }
  // console.log(LedSequence);
}

async function shiftOne() {
  var last = hour12Color;
  LedSequence.shift();
  LedSequence.push(last);
  // console.log(LedSequence);
}

async function getLeds1(hourshift) {
  // to offset the timedifference of the google cloud
  hourmod = hourshift;
  if (hourshift != 0) {
    // if this is running in the cloud then take the cloud variables
    updateVars();
  }
  // first create a blank array
  await createBlank();

  // then get the data
  // the order in which the calendars get called dictates which one gets overwritten

  await prep(calId3);
  await putAppointment(datatimes, abColor);
  // console.log("cal3: ", LedSequence)

  await prep(calId2);
  await putAppointment(datatimes, amColor);
  // console.log("cal2: ", LedSequence)

  await prep(calId);
  await putAppointment(datatimes, appointmentColor);
  // console.log("cal1: ", LedSequence)

  // overlay the hours of the day over the array
  await overlayHours();

  // dim all the leds in the past + highlight the current led
  await dimPast();

  // it allows to have a 12hr led at the end of the ledstrip
  await shiftOne();

  // for debug reasons
  console.log("ledexport: ")
  // console.log("export: ", LedSequence)
  if (hourshift != 0) { LedSequence.forEach(e => console.log(e)) }

  return { LedSequence, refreshRate, website }
}


// getLeds1(0) // > use this to debug on your device

// use below in google cloud
exports.getLeds1 = async function (req, res) {
  let atok = req.query.token;
  if (atok == accessToken){
    let nrLeds = req.query.nrLeds || req.body.nrLeds;
    let baseColor = req.query.baseColor || req.body.baseColor;
    let hourColor = req.query.hourColor || req.body.hourColor;
    let hour3Color = req.query.hour3Color || req.body.hour3Color;
    let hour12Color = req.query.hour12Color || req.body.hour12Color;
    let sleepColor = req.query.sleepColor || req.body.sleepColor;
    let nowColor = req.query.nowColor || req.body.nowColor;
    let appointmentColor = req.query.appointmentColor || req.body.appointmentColor;
    let amColor = req.query.amColor || req.body.amColor;
    let abColor = req.query.abColor || req.body.abColor;
    let pastDiv = req.query.pastDiv || req.body.pastDiv;
    let refreshRate = req.query.refreshRate || req.body.refreshRate;
    let website = req.query.website || req.body.website;
    if (nrLeds) {
      process.env.nrLeds = nrLeds;
    }
    if (baseColor) {
      process.env.baseColor = baseColor;
    }
    if (hourColor) {
      process.env.hourColor = hourColor;
    }
    if (hour3Color) {
      process.env.hour3Color = hour3Color;
    }
    if (hour12Color) {
      process.env.hour12Color = hour12Color;
    }
    if (sleepColor) {
      process.env.sleepColor = sleepColor;
    }
    if (nowColor) {
      process.env.nowColor = nowColor;
    }
    if (appointmentColor) {
      process.env.appointmentColor = appointmentColor;
    }
    if (amColor) {
      process.env.amColor = amColor;
    }
    if (abColor) {
      process.env.abColor = abColor;
    }
    if (pastDiv) {
      process.env.pastDiv = pastDiv;
    }
    if (pastDiv) {
      process.env.pastDiv = refreshRate;
    }
    if (pastDiv) {
      process.env.pastDiv = website;
    }
    res.status(200).send(await getLeds1(-1));
  }
  else
  {
    res.status(200).send(baseColor);
  }
}
