//***************************************************************
// This is Mark Kriegsman's FastLED DemoReel100 example with
// a modificaiton to use a button for changing patterns.  The
// timer used for picking a new pattern has been commented out
// and there is a button check inside the main loop now.
//
// Search for "button" to find the various button related
// code additions.
//
// You can view the serial monitor to see a message when the
// button is pressed.
//
// Marc Miller, March 2017
//   Updated Jan 2020 - for JC_button library updates
//***************************************************************

//---------------------------------------------------------------
// This uses JChristensen's Button Library from:
//   https://github.com/JChristensen/JC_Button

#include "WifiLib.h"
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>

#include <FastLED.h>
#include "JC_Button.h"    // Include Button library

// JC button setup ------------------------------------------------
const uint8_t buttonPin = 4;  // Set digital pin used with debounced pushbutton
Button myButton(buttonPin, true, true, 50);  // Declare the button

// Fastled setup -------------------------------------------------------
#define DATA_PIN    4
//#define CLK_PIN   13
#define LED_TYPE    WS2812B
#define COLOR_ORDER GRB
#define NUM_LEDS    144
CRGB leds[NUM_LEDS];
#define BRIGHTNESS          25
#define FRAMES_PER_SECOND  60
#define CALENDAR_FPS  3

CRGB prevleds[NUM_LEDS];

// Wifi setup ---------------------------------------------------
WifiLib tel(true);

const char *ssid = tel.getSsid();
const char *password = tel.getPass();
const char *website1 = tel.getSite(1);
const char *website2 = tel.getSite(2);
const int mode = tel.getMode();
const char *token = tel.getToken();

String currWebsite = String(website1);
String callWebsite = String(website1);
String useToken = String(token);
String useAction = "Calendar";

double refreshRate = 6; // how many times per minute does a webcall need to go out

// Different modes --------------------------------------------------------
int useMode = mode;
/*
  1 : show set of leds slowly
  2 : show set of leds instant
  3 : show set of colors over whole strip, with interval
  4 : update one led, no reset
  5 : test
*/

// json conversion setup -----------------------------------------------------
uint8_t Ary[432];
uint8_t i = 0, j = 0;

#define ARRAY_SIZE(array) ((sizeof(array)) / (sizeof(array[0])))

// general setup --------------------------------------------------------------
bool crashed = false;
bool showUpdates = true;

// Functions -----------------------------------------------------------
void PrintLn(String text)
{
  if (showUpdates)
  {
    Serial.println(text);
  }
}

void Print(String text)
{
  if (showUpdates)
  {
    Serial.print(text);
  }
}

//---------------------------------------------------------------
void setup() {
  Serial.begin(115200);  // Allows serial monitor output (check baud rate)
  delay(1500); // short delay for recovery
  //FastLED.addLeds<LED_TYPE,DATA_PIN,COLOR_ORDER>(leds, NUM_LEDS).setCorrection(TypicalLEDStrip);
  FastLED.addLeds<LED_TYPE,DATA_PIN,COLOR_ORDER>(leds, NUM_LEDS).setCorrection(TypicalLEDStrip);
  FastLED.setBrightness(255);
  FastLED.clear();
  
  myButton.begin();  // initialize the button object
  
  Serial.println(" basic Setup done.\n");
  
  WiFi.begin(ssid, password);

   while (WiFi.status() != WL_CONNECTED)
  {
    delay(1000);
    leds[0] = CRGB(20, 20, 20); // show blinking led when searching for wifi network
    FastLED.show();
    Print(".");
    delay(1000);
    leds[0] = CRGB(50, 100, 150);
    FastLED.show();
  }
  PrintLn("");
  PrintLn("Connected");
  leds[0] = CRGB(0, 50, 0); // show green led when connected to wifi
  FastLED.show();

  // do a first call to the website to get the led sequence
  setWebsite(1);
  CallWebsite();
  
}


// List of patterns to cycle through.  Each is defined as a separate function below.
typedef void (*SimplePatternList[])();
SimplePatternList gPatterns = { Calendar, AllWhite, twoDots, confetti_GB, rainbow, confetti, sinelon, juggle };

uint8_t gCurrentPatternNumber = 0; // Index number of which pattern is current
uint8_t gHue = 0; // rotating "base color" used by many of the patterns


//---------------------------------------------------------------
void loop()
{
  // BUTTON STUFF
  // Not using this timer to change patterns any more.  Instead check the button.
  //   EVERY_N_SECONDS( 10 ) { nextPattern(); } // change patterns periodically
  readbutton();  // check for button press
  
  // Call the current pattern function once, updating the 'leds' array
  gPatterns[gCurrentPatternNumber]();

  // send the 'leds' array out to the actual LED strip
  FastLED.show();  
  // insert a delay to keep the framerate modest
  if (gCurrentPatternNumber != 0) // not calendar
  {
      FastLED.delay(1000/FRAMES_PER_SECOND); 
  }
  else // calendar
  {
     FastLED.delay(1000/CALENDAR_FPS); 
  }
  

  // do some periodic updates
  EVERY_N_MILLISECONDS( 20 ) { gHue++; } // slowly cycle the "base color" through the rainbow

}//end_main_loop

#define ARRAY_SIZE(A) (sizeof(A) / sizeof((A)[0]))


//---------------------------------------------------------------
void nextPattern()
{
  // add one to the current pattern number, and wrap around at the end
  gCurrentPatternNumber = (gCurrentPatternNumber + 1) % ARRAY_SIZE( gPatterns);
  if (gCurrentPatternNumber != 0) // not calendar
  {
    FastLED.setBrightness(BRIGHTNESS);
  }
  else // calendar
  {
     FastLED.setBrightness(255);;
  }
  Serial.println(gCurrentPatternNumber);
}

//////////////////////////
void Calendar() {
  EVERY_N_MILLISECONDS(60000 / refreshRate) {
    if (!crashed){
    setWebsite(1);
      }
    CallWebsite();
  }
}

//////////////////////////
void AllWhite() {
  fill_solid( leds, NUM_LEDS, CRGB(255,255,200)); //GRB
  EVERY_N_MILLISECONDS(3000) {
    leds[0] = CRGB(200,200,50);
  }
}

//////////////////////////
void rainbow() 
{
  // FastLED's built-in rainbow generator
  fill_rainbow( leds, NUM_LEDS, gHue, 12);
}

//////////////////////////
void confetti() 
{
  // random colored speckles that blink in and fade smoothly
  fadeToBlackBy( leds, NUM_LEDS, 20);
  int pos = random16(NUM_LEDS);
  leds[pos] += CHSV( gHue + random8(64), random8(128,200), random8(48,255));
}


//////////////////////////
void confetti_GB()
{
  // random colored speckles, Green and Blue hues only
  // Green = 96, Blue = 160
  uint8_t p = 25;  // What percentage of the time to make speckles.  [Range 0-100]

  fadeToBlackBy( leds, NUM_LEDS, 10);
  if (random8(100) < p) {
    int pos = random16(NUM_LEDS);
    uint8_t hue = random8(2);  // randomly chooses a 0 or 1
    if (hue == 0) {
      hue = random8(92,111);  // pick a hue somewhere in the green zone
    } else {
      hue = random8(156,165);  // pick a hue somewhere in the blue zone
    }
    leds[pos] += CHSV( hue, random8(200,240), 255);
  }
}//end confetti_GB


//////////////////////////
void sinelon()
{
  // a colored dot sweeping back and forth, with fading trails
  fadeToBlackBy( leds, NUM_LEDS, 12);
  int pos = beatsin16( 13, 0, NUM_LEDS-1 );
  leds[pos] += CHSV( gHue, 255, 192);
}

//////////////////////////
void juggle() {
  // four colored dots, weaving in and out of sync with each other
  fadeToBlackBy( leds, NUM_LEDS, 20);
  byte dothue = 0;
  for( int i = 0; i < 4; i++) {
    leds[beatsin16( i+5, 0, NUM_LEDS-1 )] |= CHSV(dothue, 200, 255);
    dothue += 32;
  }
}


//////////////////////////
void twoDots() {
  
  static uint8_t pos;  //used to keep track of position
  EVERY_N_MILLISECONDS(70) {
    fadeToBlackBy( leds, NUM_LEDS, 200);  //fade all the pixels some
    leds[pos] = CHSV(gHue, random8(170,230), 255);
    //leds[(pos+5) % NUM_LEDS] = CHSV(gHue+64, random8(170,230), 255);
    pos = pos + 1;  //advance position
    
    //This following check is very important.  Do not go past the last pixel!
    if (pos == NUM_LEDS) { pos = 0; }  //reset to beginning
    //Trying to write data to non-existent pixels causes bad things.
  }
}//end_twoDots



//---------------------------------------------------------------

//---------Function to read the button and do something----------
//   This section could be changed to use a potentiometer,
//   encoder, or something else to trigger a pattern change.
//   Depending on what was used, the nextPattern() function
//   might need to be updated as well to have things work
//   the way you intend.

void readbutton() {
  myButton.read();
  if(myButton.wasPressed()) {
    Serial.println("Button pressed!  Next pattern...   ");
    nextPattern();  // Change to the next pattern

    //Flash pixel zero white as a visual that button was pressed.
    leds[0] = CHSV(0,0,255);  //Set first pixel color white
    FastLED.show();  //Update display
    delay(100);  //Short pause so we can see leds[0] flash on
    leds[0] = CRGB::Black;  //Set first pixel off
    FastLED.show();
    delay(100);
  }
}//end_readbutton


//----------------------------------------------------------------------
void CallWebsite()
{
  // call the website to get an array of RGB values in return

  if (WiFi.status() == WL_CONNECTED)
  { //Check WiFi connection status
    HTTPClient http; //Declare an object of class HTTPClient
    String call = callWebsite;
    PrintLn(" ");
    PrintLn("___ FROM Here ___");
    PrintLn("call: " + String(call));
    http.begin(call); //Specify request destination

    PrintLn("reaching site");
    int httpCode = http.GET(); //Send the request
    if (httpCode == 200)
    { //Check the returning code
      PrintLn("response: " + String(httpCode));
      String payload = http.getString(); //Get the request response payload
      PrintLn(payload);

      PrintLn("payload above"); //Print the response payload
      StringToJson(payload);
      crashed = false;
    }
    else
    {
      PrintLn("failed");
      crashed = true;
      //String payload = http.getString(); //Get the request response payload
      showRed();
      setWebsite(0);
      //PrintLn(payload);
    }
    http.end(); //Close connection
  }
}

void setWebsite(int type) {
  if (type == 1) {
    callWebsite = currWebsite + "?token=" + String(token);
  }
  else if (type == 2) {
    callWebsite = currWebsite + "?token=" + String(token) + "&refreshRate=6";
  }
  else if (type == 3) {
    callWebsite = String(website1) + "?token=" + String(token) + "&refreshRate=6" + "&mode=1" + "&action=Calendar" + "&website=" + String(website1);
  }
  else  {
    callWebsite = currWebsite + "?token=" + String(token) + "&refreshRate=6";
  }
}

void StringToJson(String textIn)
{
  // convert the string into a json document.
  DynamicJsonDocument doc(14999);
  deserializeJson(doc, textIn);
  JsonObject obj = doc.as<JsonObject>();
  JsonToMode(obj);
  JsonToFastled(obj);
  JsonToRefreshRate(obj);
  JsonToWebsite(obj);
  JsonToAction(obj);
}

int arraySize(JsonObject obj) {
  JsonArray array = obj[String("LedSequence")];
  int arraysize = array.size();
  return arraysize;
}

void JsonToFastled(JsonObject obj)
{
  // put the values of the json document into the ledstring
  if (useMode == 1)
  { // slow showing of set
    PrintLn("Mode 1");
    //int maxi = arraySize(obj)+1;
    for (int i = 0; i < NUM_LEDS; i++)
    {
      int R = obj[String("LedSequence")][i][0];
      int G = obj[String("LedSequence")][i][1];
      int B = obj[String("LedSequence")][i][2];
      leds[i] = CRGB(R, G, B);
      FastLED.show();
      delay(30);
    }
  }
  else if (useMode == 2)
  { // show set instant
    PrintLn("Mode 2");
    for (int i = 0; i < NUM_LEDS; i++)
    {
      int R = obj[String("LedSequence")][i][0];
      int G = obj[String("LedSequence")][i][1];
      int B = obj[String("LedSequence")][i][2];
      leds[i] = CRGB(R, G, B);
    }
    FastLED.show();
  }
  else if (useMode == 3)
  { // show set of colors over whole strip, with interval
    PrintLn("Mode 3");
    fullBar(obj, true);
  }
  else if (useMode == 4)
  { // show one led
    PrintLn("Mode 4");
    oneLed(obj);
  }
  else if (useMode == 5)
  { // slow showing of set + dimming
    PrintLn("Mode 5");
    for (int i = 0; i < NUM_LEDS; i++)
    {
      leds[i] = CRGB(0, 0, 0);
      FastLED.show();
      delay(30);
      int R = obj[String("LedSequence")][i][0];
      int G = obj[String("LedSequence")][i][1];
      int B = obj[String("LedSequence")][i][2];
      leds[i] = CRGB(R, G, B);
      FastLED.show();
      delay(30);
    }
  }
  else if (useMode == 6)
  { // fast flash
    PrintLn("Mode 6");
    // save current
    //prevleds = leds; // save previous
    for (int i = 0; i < 144; i++)
    {
      prevleds[i] = leds[i];
    }
    fullBar(obj, false);
    for (int i = 0; i < 144; i++) // take back te previous
    {
      leds[i] = prevleds[i];
    }
    FastLED.show();
  }
  else
  {
    PrintLn("Mode Else");
    leds[0] = CRGB(1, 0, 0); // something is wrong
    FastLED.show();
    delay(300);
    leds[0] = CRGB(0, 0, 0);
    FastLED.show();
    delay(300);
  }
}

void fullBar(JsonObject obj, bool slow)
{
  int interval = obj[String("LedSequence")][0][0]; // first array contains the interval
  int maxi = arraySize(obj);
  for (int i = 1; i < maxi; i++)
  {
    int R = obj[String("LedSequence")][i][0];
    int G = obj[String("LedSequence")][i][1];
    int B = obj[String("LedSequence")][i][2];
    fill_solid(leds, NUM_LEDS, CRGB(R, G, B));
    FastLED.show();
    if (slow)
    {
      if (i < maxi - 1)
      {
        delay(interval);
      }
    }
    else
    {
      delay(interval);
    }
  }
  //Serial.print("leds: ");
  //Serial.print(leds[0][0]);
  //Serial.print(leds[0][1]);
  //Serial.println(leds[0][2]);
}

void oneLed(JsonObject obj)
{
  int pos = obj[String("LedSequence")][0][0]; // first array contains the led position
  int R = obj[String("LedSequence")][1][0];
  int G = obj[String("LedSequence")][1][1];
  int B = obj[String("LedSequence")][1][2];
  leds[pos] = CRGB(R, G, B);
  FastLED.show();
}

void JsonToRefreshRate(JsonObject obj)
{

  if (obj[String("refreshRate")] != 0) {
    refreshRate = obj[String("refreshRate")];
  }
  Print("refreshrate: ");
  PrintLn(String(refreshRate));
}

void JsonToWebsite(JsonObject obj)
{
  currWebsite = obj[String("website")].as<String>();
  Print("website: ");
  PrintLn(currWebsite);
}

void JsonToMode(JsonObject obj)
{
  useMode = obj[String("mode")];
  Print("mode: ");
  PrintLn(String(useMode));
}

void JsonToAction(JsonObject obj)
{
  useAction = obj[String("action")].as<String>();
  Print("action: ");
  PrintLn(String(useAction));
}

void showRed(){
  leds[0] = CRGB(20, 0, 0); // show blinking led when searching for wifi network
  FastLED.show();
  delay(1000);
  leds[0] = CRGB(1, 0, 0); // show blinking led when searching for wifi network
  FastLED.show();
  }

void bpm()
{
  // colored stripes pulsing at a defined Beats-Per-Minute (BPM)
  uint8_t BeatsPerMinute = 62;
  CRGBPalette16 palette = PartyColors_p;
  uint8_t beat = beatsin8(BeatsPerMinute, 64, 255);
  for (int i = 0; i < NUM_LEDS; i++)
  { //9948
    leds[i] = ColorFromPalette(palette, gHue + (i * 2), beat - gHue + (i * 10));
  }
}
