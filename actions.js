const hlp = require("./helper");

let refreshRate = 10;
let website = "testWebsite";
let LedSequence = [];
let Color = "Red";
let Colors = false;
let Color0 = [1, 0, 0] // the basecolor
let Color1 = [4, 2, 0] // the first special color
let Color2 = [4, 4, 0]
let Color3 = [4, 4, 4]
let mode = 1;
// let actions = ["Calendar", "CountUp", "CountDown", "Manual", "Weather", "DailyTask"];
let runAction = false;
let count = 1;
let maxCount = 5;
let delay = 300;
let showPrint = true;

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

async function CountUp() {         //  create a loop function
    hlp.Print("runaction: " + runAction);
    if (count < maxCount && runAction) {           //  if the counter < 10, call the loop function
        hlp.Print(count);

        // code
        if (count > 0) {
            pushSpecial(count, 5, 10, 30)
        }

        hlp.Print(LedSequence);
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

async function testCountDown(nrMinutes) {         //  create a loop function
    setTimeout(function () {   //  call a 3s setTimeout when the loop is called
        hlp.Print(count);

        // code
        if (count > 0) {
            pushSpecial(count, 5, 10, 30)
        }

        hlp.Print(LedSequence);
        count++;                    //  increment the counter

        if (count < maxCount && runAction) {           //  if the counter < 10, call the loop function
            testCountDown();             //  ..  again which will trigger another 
        }                       //  ..  setTimeout()
    }, delay)
}



// functies
module.exports.CountUp = CountUp;
module.exports.TestCountUp = testCountUp;
// module.exports.CountUp = CountDown;
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
