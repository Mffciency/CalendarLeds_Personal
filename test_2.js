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
let LedSequence = act.LedSequence;
let Color0 = act.Color0;
let Color1 = act.Color1;
let Color2 = act.Color2;
let Color3 = act.Color3;
let mode = act.Mode;
// let actions = ["Calendar", "CountUp", "CountDown", "Manual", "Weather", "DailyTask"];
let action = "";
let opr = "";
// let runAction = act.RunAction;
let count = act.Count;
let maxCount = act.MaxCount;
let delay = act.Delay;


function Manual(modeIn, refreshRateIn, websiteIn, sequenceIn) {
    modeOut = modeIn;
    refreshRateOut = refreshRateIn;
    websiteOut = websiteIn;
    sequenceOut = sequenceIn;
}


async function getTest(ord) {//, modeIn, refreshRateIn, websiteIn, sequenceIn) {
    hlp.Print("count: " + count);
    hlp.Print("maxcount: " + maxCount);
    act.CountUp();
    action = "CountUp";

    mode = process.env.mode;
    console.log("after mode");
    refreshRate = parseFloat(process.env.refreshRate);
    console.log("after refreshRate");
    website = process.env.website;
    console.log("after website");

    return { action, mode, refreshRate, website, LedSequence }
}




/*
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

readline.question('Input ', inp => {
    hlp.Print("runaction: " + runAction);
    runAction = Boolean(inp);
    console.log(`input: ${inp}!`);
    hlp.Print("runaction: " + runAction);
    readline.close();
});

getTest(1)


if (process.env.Color == "Red") {
        console.log("went into if");
        process.env.Color = "Orange";
        LedSequence = LedSequence1;

    }
    else {
        console.log("went into if 2");
        process.env.Color = "Red";
        LedSequence = LedSequence2;
    }
    console.log("for base");
    if (Colors){
        baseColor = JSON.parse(process.env.baseColor);
        console.log("after base");
        hourColor = JSON.parse(process.env.hourColor);
        console.log("after hour");
    }

    mode = process.env.mode;
    console.log("after mode");
    refreshRate = parseFloat(process.env.refreshRate);
    console.log("after refreshRate");
    website = process.env.website;
    console.log("after website");

    if (mode == 1 || mode == 2) {
        if (Color == "Red") {
            Color = "Orange";
            LedSequence = LedSequence1;
        }
        else if (Color == "Orange") {
            Color = "Red";
            LedSequence = LedSequence2;
        }
    }
    else {
        LedSequence = [baseColor, hourColor, [0,2,2],[2,0,2]]
    }
    console.log(Color);
*/
exports.getTest = async function (req, res) {
    let atok = req.query.token;
    if (atok == accessToken) {     
        // general
        let action = req.query.action || req.body.action;
        let mode = req.query.mode || req.body.mode;
        let refreshRate = req.query.refreshRate || req.body.refreshRate;
        let website = req.query.website || req.body.website;
        let ManualLedSequence = req.query.ManualLedSequence || req.body.ManualLedSequence;
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
            act.Count = 0;
            act.RunAction = true;
            act.LedSequence = [];
        }
        if (stop) {
            hlp.Print("stop");
            process.env.stop = stop;
            act.RunAction = false;
        }
        res.status(200).send(await getTest());
    }
    else {
        res.status(200).send(Color0);
    }
}
