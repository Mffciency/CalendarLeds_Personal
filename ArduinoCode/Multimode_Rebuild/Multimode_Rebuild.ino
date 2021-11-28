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

#include <FastLED.h>
#include "JC_Button.h"    // Include Button library
const uint8_t buttonPin = 4;  // Set digital pin used with debounced pushbutton
Button myButton(buttonPin, true, true, 50);  // Declare the button

#define DATA_PIN    4
//#define CLK_PIN   13
#define LED_TYPE    WS2812B
#define COLOR_ORDER GRB
#define NUM_LEDS    144
CRGB leds[NUM_LEDS];
#define BRIGHTNESS          25
#define FRAMES_PER_SECOND  60

//---------------------------------------------------------------
void setup() {
  Serial.begin(115200);  // Allows serial monitor output (check baud rate)
  delay(1500); // short delay for recovery
  //FastLED.addLeds<LED_TYPE,DATA_PIN,COLOR_ORDER>(leds, NUM_LEDS).setCorrection(TypicalLEDStrip);
  FastLED.addLeds<LED_TYPE,DATA_PIN,COLOR_ORDER>(leds, NUM_LEDS).setCorrection(TypicalLEDStrip);
  FastLED.setBrightness(BRIGHTNESS);
  FastLED.clear();
  
  myButton.begin();  // initialize the button object

  Serial.println("Setup done.\n");
}


// List of patterns to cycle through.  Each is defined as a separate function below.
typedef void (*SimplePatternList[])();
SimplePatternList gPatterns = { AllWhite, twoDots, confetti_GB, rainbow, confetti, sinelon, juggle };

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
  FastLED.delay(1000/FRAMES_PER_SECOND); 

  // do some periodic updates
  EVERY_N_MILLISECONDS( 20 ) { gHue++; } // slowly cycle the "base color" through the rainbow

}//end_main_loop

#define ARRAY_SIZE(A) (sizeof(A) / sizeof((A)[0]))


//---------------------------------------------------------------
void nextPattern()
{
  // add one to the current pattern number, and wrap around at the end
  gCurrentPatternNumber = (gCurrentPatternNumber + 1) % ARRAY_SIZE( gPatterns);
  Serial.println(gCurrentPatternNumber);
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


//---------
