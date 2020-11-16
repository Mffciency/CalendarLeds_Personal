/*
a test script to work out a few things
*/

const baseWebsite = require('./login.json').web;
const testWebsite = require('./login.json').web2;

var LedSequence1 = require('./info.json').LedSequence1;
var LedSequence2 = require('./info.json').LedSequence2;



var refreshRate = 10;
var website = testWebsite;
var LedSequence = [];
var Color = "Red";
var Colors = false;
var baseColor = [20, 0, 0]//[0, 0, 0] // the background color
var hourColor = [0, 20, 0]//[4, 2, 8
var mode = 1;

async function getTest() {
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

    return { LedSequence, refreshRate, website, mode }
}


exports.getTest = async function (req, res) {
    let baseColor = req.query.baseColor || req.body.baseColor;
    let hourColor = req.query.hourColor || req.body.hourColor;
    let refreshRate = req.query.refreshRate || req.body.refreshRate;
    let website = req.query.website || req.body.website;
    let mode = req.query.mode || req.body.mode;
    if (baseColor) {
        process.env.baseColor = baseColor;
        Colors = true;
    } else{
        Colors = false;
    }
    if (hourColor) {
        process.env.hourColor = hourColor;
    }
    if (refreshRate) {
        process.env.refreshRate = refreshRate;
    }
    if (website) {
        process.env.website = website;
    }
    if (mode) {
        process.env.mode = mode;
    }
    res.status(200).send(await getTest());
}
