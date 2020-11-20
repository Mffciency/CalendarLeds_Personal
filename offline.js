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
let Color0 = act.Color0;
let Color1 = act.Color1;
let Color2 = act.Color2;
let Color3 = act.Color3;
let mode = act.Mode;
let action = "Calendar";
let opr = "";
let runAction = true;

let count = act.Count;
let maxCount = act.MaxCount;
let delay = act.Delay;
let minutes = 5;

async function setValues() {
    // action = process.env.action;
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
    await hlp.Print("countdonw: " + count);
    await hlp.Print("minutes: " + minutes);
    let result = await act.CountDown(minutes);
    if (result == 0) {
        website = baseWebsite;
    }
}

async function Manual() {
    act.SetLedSequence(JSON.parse(process.env.ManualLedSequence));
}

async function Calendar() {
    console.log("before cal");
    await act.CreateCalendar();
    console.log("after cal");
}

async function pickAction() {
    if (action == "CountUp") {
        await TestCountUp();
    }
    else if (action == "CountDown") {
        await TestCountDown();
    }
    else if (action == "Manual") {
        await Manual();
    }
    else if (action == "Calendar") {
        
        await Calendar();
        let LedSequence = await act.GetLedSequence(); 
    }
    console.log("fake END ========");
}

async function getTest(ord) {//, modeIn, refreshRateIn, websiteIn, sequenceIn) {
    console.log("");
    console.log("");
    console.log("=====================================================");
    await setValues();
    
    await pickAction();


    let LedSequence = await act.GetLedSequence();
    console.log("True END ===========================", LedSequence);
    
    // hlp.Print("count: " + count);
    // hlp.Print("maxcount: " + maxCount);
    // let ces = "[[0,0,0],[0,0,0]]"
    // // console.log(JSON.parse(ces));
    
    // act.SetRunAction("start");
    // act.SetCount(0);
    // await act.SetLedSequence(JSON.parse(ces));
    // LedSequence = act.GetLedSequence();
    // // console.log(LedSequence)
    // let result = await act.TestCountDown(5);
    // // action = "CountUp";
    // console.log(" result ::", result);

    // mode = process.env.mode;
    // console.log("after mode");
    // refreshRate = parseFloat(process.env.refreshRate);
    // console.log("after refreshRate");
    // website = process.env.website;

    // console.log("after website");

    // console.log(action, mode, refreshRate, website, LedSequence )
}





// const readline = require('readline').createInterface({
//     input: process.stdin,
//     output: process.stdout
// });

// readline.question('Input ', inp => {
//     hlp.Print("runaction: " + runAction);
//     runAction = inp;
//     act.SetRunAction(inp);
//     console.log(`input: ${inp}!`);
//     hlp.Print("runaction: " + runAction);
//     readline.close();
// });

getTest(1)
/*

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
