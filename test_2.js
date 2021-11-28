/*
following tutorial: https://www.youtube.com/watch?v=PFmuCDHHpwk
https://youtu.be/PFmuCDHHpwk?t=1505
*/

const baseWebsite = require('./login.json').web;
const testWebsite = require('./login.json').web2;
const accessToken = require('./login.json').at;
const act = require("./actions");
const hlp = require("./helper");

let LedSequence1 = require('./info.json').LedSequence1;
let LedSequence2 = require('./info.json').LedSequence2;


let refreshRate = 10;
let website = testWebsite;
// let LedSequence = act.LedSequence;
let Color0 = act.Color0;
let Color1 = act.Color1;
let Color2 = act.Color2;
let Color3 = act.Color3;
let mode = act.Mode;
// let actions = ["Calendar", "CountUp", "CountDown", "Manual", "Weather", "DailyTask"];
let action = "CountUp";
let opr = "";
// let runAction = act.RunAction;
let count = act.Count;
let maxCount = act.MaxCount;
let delay = act.Delay;
let minutes = 5;


function Manual(modeIn, refreshRateIn, websiteIn, sequenceIn) {
    modeOut = modeIn;
    refreshRateOut = refreshRateIn;
    websiteOut = websiteIn;
    sequenceOut = sequenceIn;
}


async function getTest(ord) {//, modeIn, refreshRateIn, websiteIn, sequenceIn) {
    action = process.env.action;
    console.log("after action");
    mode = process.env.mode;
    console.log("after mode");
    refreshRate = parseFloat(process.env.refreshRate);
    console.log("after refreshRate");
    website = process.env.website;
    console.log("after website");
    if (action == "CountUp"){
        await hlp.Print("count: " + count);
        await hlp.Print("maxcount: " + maxCount);
        await act.CountUp();
    }
    else if (action == "CountDown"){
        minutes = process.env.minutes;
        await hlp.Print("countdonw: " + count);
        await hlp.Print("minutes: " + minutes);
        let result = await act.CountDown(minutes);
        if (result == 0){
            website = baseWebsite;
        }
    }
    else if (action == "Manual"){
        await act.SetLedSequence(JSON.parse(process.env.ManualLedSequence));
    }
    

    let LedSequence = act.GetLedSequence();

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
        let ManualLedSequence = req.query.LedSequence || req.body.LedSequence;
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
        if (ManualLedSequence) {
            process.env.ManualLedSequence = ManualLedSequence;
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
        
        res.status(200).send(await getTest());
    }
    else {
        res.status(200).send(Color0);
    }
}
