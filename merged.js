/*
following tutorial: https://www.youtube.com/watch?v=PFmuCDHHpwk
https://youtu.be/PFmuCDHHpwk?t=1505
*/

const baseWebsite = require('./login.json').web;
const testWebsite = require('./login.json').web2;
const accessToken = require('./login.json').at;
const act = require("./actions");
const hlp = require("./helper");



let refreshRate = 10;
let website = testWebsite;
let indColor0 = act.indColor0;
let indColor1 = act.indColor1;
let indColor2 = act.indColor2;
let indColor3 = act.indColor3;
let mode = act.Mode;
let action = "Calendar";
let opr = "";

let count = act.Count;
let maxCount = act.MaxCount;
let delay = act.Delay;
let minutes = 5;

async function setValues() {
    action = process.env.action;
    console.log("after action");
    mode = process.env.mode;
    console.log("after mode");
    refreshRate = parseFloat(process.env.refreshRate);
    console.log("after refreshRate");
    website = process.env.website;
    console.log("after website");
}

async function CountUp() {
    await hlp.Print("count: " + count);
    await hlp.Print("maxcount: " + maxCount);
    await act.CountUp();
}

async function CountDown() {
    minutes = process.env.minutes;
    await hlp.Print("countdown: " + count);
    await hlp.Print("minutes: " + minutes);
    let result = await act.CountDown(minutes);
    if (result == 0) {
        action = "Calendar";
        mode = 1;
    }
}

async function Manual() {
    await act.SetLedSequence(JSON.parse(process.env.ManualLedSequence));
}

async function Calendar(hourshift) {
    await act.CreateCalendar(hourshift);
}

async function getTest(hourshift) {//, modeIn, refreshRateIn, websiteIn, sequenceIn) {
    await setValues();
    
    if (action == "CountUp") {
        await CountUp();
    }
    else if (action == "CountDown") {
        await CountDown();
    }
    else if (action == "Manual") {
        await Manual();
    }
    else if (action == "Calendar") {
        await Calendar(hourshift);
    }

    let LedSequence = await act.GetLedSequence();
    
    return { action, mode, refreshRate, website, LedSequence }
}

exports.getTest = async function (req, res) {
    let atok = req.query.token;
    if (atok == accessToken) {
        // general
        let action = req.query.action || req.body.action;
        let mode = req.query.mode || req.body.mode;
        let refreshRate = req.query.refreshRate || req.body.refreshRate;
        let website = req.query.website || req.body.website;
        if (action) {
            process.env.action = action;
        }
        if (mode) {
            process.env.mode = mode;
        }
        if (refreshRate) {
            process.env.refreshRate = refreshRate;
        }
        if (website) {
            process.env.website = website;
        }

        // for count up
        let start = req.query.start || req.body.start;
        let stop = req.query.stop || req.body.stop;
        if (start) {
            hlp.Print("start");
            process.env.start = start;
            act.SetCount(0);
            act.SetRunAction("start");
            act.SetLedSequence([]);
        }
        if (stop) {
            hlp.Print("stop");
            process.env.stop = stop;
            act.SetRunAction("stop");
        }

        // for count down
        let minutes = req.query.minutes || req.body.minutes;
        if (minutes) {
            hlp.Print("start");
            process.env.minutes = minutes;
            act.SetCount(-1);
            process.env.start = start;
            act.SetRunAction("start");
            act.SetLedSequence([]);
            // process.env.refreshRate = 1;
        }

        // for manual
        let ManualLedSequence = req.query.LedSequence || req.body.LedSequence;
        if (ManualLedSequence) {
            process.env.ManualLedSequence = ManualLedSequence;
        }

        // for calendar

        let indColor0 = req.query.indColor0 || req.body.indColor0; // base color
        let indColor1 = req.query.indColor1 || req.body.indColor1; // color for ex each hour
        let indColor2 = req.query.indColor2 || req.body.indColor2; // color for ex each 3 hours
        let indColor3 = req.query.indColor3 || req.body.indColor3; // color for ex each 12 hours
        let nowColor = req.query.nowColor || req.body.nowColor; // color for indicating where we are now
        let sleepColor = req.query.sleepColor || req.body.sleepColor; // color for indicating night time, TODO: variable night hours
        let appColor0 = req.query.appColor0 || req.body.appColor0;
        let appColor1 = req.query.appColor1 || req.body.appColor1;
        let appColor2 = req.query.appColor2 || req.body.appColor2;
        let appColor3 = req.query.appColor3 || req.body.appColor3;
        let appColor4 = req.query.appColor4 || req.body.appColor4;
        let pastDiv = req.query.pastDiv || req.body.pastDiv;
        if (indColor0) {
            process.env.indColor0 = indColor0;
        }
        if (indColor1) {
            process.env.indColor1 = indColor1;
        }
        if (indColor2) {
            process.env.indColor2 = indColor2;
        }
        if (indColor3) {
            process.env.indColor3 = indColor3;
        }
        if (nowColor) {
            process.env.nowColor = nowColor;
        }
        if (sleepColor) {
            process.env.sleepColor = sleepColor;
        }
        if (appColor0) {
            process.env.appColor0 = appColor0;
        }
        if (appColor1) {
            process.env.appColor1 = appColor1;
        }
        if (appColor2) {
            process.env.appColor2 = appColor2;
        }
        if (appColor3) {
            process.env.appColor3 = appColor3;
        }
        if (appColor4) {
            process.env.appColor4 = appColor4;
        }
        if (pastDiv) {
            process.env.pastDiv = pastDiv;
        }

        // settings
        let nrLeds = req.query.nrLeds || req.body.nrLeds;
        if (nrLeds) {
            process.env.nrLeds = nrLeds;
        }

        res.status(200).send(await getTest(-1));
    }
    else {
        res.status(200).send(indColor0);
    }
}
