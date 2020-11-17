const hlp = require("./helper");

let nrLeds = 144;
let refreshRate = 10;
let website = "testWebsite";
let LedSequence = [];
let Color = "Red";
let Colors = false;
let Color0 = [1, 0, 0] // the basecolor
let Color1 = [4, 2, 0] // the first special color
let Color2 = [4, 4, 0]
let Color3 = [4, 4, 4]
let ColorBad = [1, 0, 0]
let ColorGood = [0, 2, 0]
let mode = 1;
// let actions = ["Calendar", "CountUp", "CountDown", "Manual", "Weather", "DailyTask"];
let runAction = false;
let count = 1;
let maxCount = 60;
let delay = 1300;
let parts = 0;
let showPrint = true;

function picRunAct(prc) {         //  create a loop function
    if (prc == "start") {
        runAction = true;
    }
    if (prc == "stop") {
        runAction = false;
    }
}

function setLedSequence(scnc) {         //  create a loop function
    LedSequence = scnc;
}

function getLedSequence() {         //  create a loop function
    return LedSequence;
}

function setCount(cnt) {         //  create a loop function
    count = cnt;
}

function pushSpecial(count, pos1, pos2, pos3) {
    if (count % pos3 == 0) {
        LedSequence.push(Color3);
    }
    else if (count % pos2 == 0) {
        LedSequence.push(Color2);
    }
    else if (count % pos1 == 0) {
        LedSequence.push(Color1);
    }
    else {
        LedSequence.push(Color0);
    }
}

function createBlank() {
    for (let index = 0; index < nrLeds; index++) {
        LedSequence[index] = [0, 0, 0];
    }
}

function createFull(rgb) {
    for (let index = 0; index < nrLeds; index++) {
        LedSequence[index] = rgb;
    }
}

function fillSet(start, stop, rgb) {
    for (let index = start; index < stop; index++) {
        LedSequence[index] = rgb;
    }
}


async function CountUp(prc) {         //  create a loop function
    hlp.Print("runaction: " + runAction);
    if (count < maxCount && runAction) {           //  if the counter < 10, call the loop function
        hlp.Print(count);

        // code
        if (count > 0) {
            pushSpecial(count, 5, 10, 30)
        }

        hlp.Print("in countup" + LedSequence);
        count++;                    //  increment the counter
    }                       //  ..  setTimeout()
}

async function testCountUp() {         //  create a loop function
    setTimeout(function () {   //  call a 3s setTimeout when the loop is called
        hlp.Print(count);

        // code
        if (count > 0) {
            pushSpecial(count, 5, 10, 30)
        }

        hlp.Print(LedSequence);
        count++;                    //  increment the counter

        if (count < maxCount && runAction) {           //  if the counter < 10, call the loop function
            testCountUp();             //  ..  again which will trigger another 
        }                       //  ..  setTimeout()
    }, delay)
}

async function CountDown(nrMinutes) {         //  create a loop function
    if (nrMinutes == 0) {
        return;
    }

    if (count <= nrMinutes && runAction) {     //  call a 3s setTimeout when the loop is called
        hlp.Print("count" + count);
        hlp.Print("minutes" + nrMinutes);
        // code
        if (count > 0) {
            let start = (count - 1) * parts;
            let stop = (count) * parts;
            hlp.Print("startstop: " + start + stop);
            fillSet(start, stop, ColorGood)
        } else {
            hlp.Print("creating full");
            createFull(ColorBad);
            parts = Math.ceil(nrLeds / nrMinutes);
            hlp.Print("runaction parts: " + runAction + parts);
        }
        hlp.Print(LedSequence);
        count++;                    //  increment the counter
    }
}

async function testCountDown(nrMinutes) {         //  create a loop function
    if (nrMinutes == 0) { return; }


    createFull(ColorBad);
    // hlp.Print(LedSequence);

    parts = Math.round(nrLeds / nrMinutes);
    hlp.Print("runaction parts: " + runAction + parts);
    testCountDownLoop(nrMinutes);


}
async function testCountDownLoop(nrMinutes) {         //  create a loop function

    setTimeout(function () {   //  call a 3s setTimeout when the loop is called
        hlp.Print(count);

        // code
        if (count > 0) {
            let start = (count - 1) * parts;
            let stop = (count) * parts;
            hlp.Print("startstop: " + start + stop);
            fillSet(start, stop, ColorGood)
        }

        hlp.Print(LedSequence);
        count++;                    //  increment the counter

        if (count <= nrMinutes && runAction) {           //  if the counter < 10, call the loop function
            testCountDownLoop(nrMinutes);             //  ..  again which will trigger another 
        }                       //  ..  setTimeout()
    }, delay)
}



// functies
module.exports.SetRunAction = picRunAct;
module.exports.SetLedSequence = setLedSequence;
module.exports.GetLedSequence = getLedSequence;
module.exports.SetCount = setCount;
module.exports.CountUp = CountUp;
module.exports.TestCountUp = testCountUp;
module.exports.CountDown = CountDown;
module.exports.TestCountDown = testCountDown;

// variablen
module.exports.LedSequence = LedSequence;
module.exports.Count = count;
// let refreshRate = 10;
// let website = "testWebsite";

module.exports.Color0 = Color0;
module.exports.Color1 = Color1;
module.exports.Color2 = Color2;
module.exports.Color3 = Color3;
module.exports.Mode = mode;

module.exports.RunAction = runAction;

module.exports.MaxCount = maxCount;
module.exports.Delay = delay;
