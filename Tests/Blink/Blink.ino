#include <FastLED.h>

// How many leds in your strip?
#define NUM_LEDS 144


#define DATA_PIN 4


// Define the array of leds
CRGB leds[NUM_LEDS];

void setup() { 
    FastLED.addLeds<WS2812B, DATA_PIN>(leds, NUM_LEDS);  // GRB ordering is assumed
   
}

void loop() { 
  // Turn the LED on, then pause
  //leds[0] = CRGB::Red;
  fill_solid( leds, NUM_LEDS, CRGB(50,50,50));
  //fill_solid( leds, NUM_LEDS, CRGB(100,100,100));
  //fill_solid( leds, NUM_LEDS, CRGB(255,255,255));
  FastLED.show();
  delay(500);
  // Now turn the LED off, then pause
  leds[0] = CRGB::Black;
  FastLED.show();
  delay(500);
}
