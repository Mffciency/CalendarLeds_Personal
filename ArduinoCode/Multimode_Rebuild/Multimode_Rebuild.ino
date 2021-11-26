/*
  To remember: always save modifications!
  Todo:
  - add local webpage to cycle between modes
  - show future/previous days
  - show temperature/cloudcoverage
  - show sunrise/sunset
  - discomode
  - animate on phone notification
  - change refresh rate
*/

#include "WifiLib.h"
#include "Helpers.h"

Helpers h();




void setup()
{
  FastLED.addLeds<LED_TYPE, DATA_PIN, COLOR_ORDER>(leds, NUM_LEDS).setCorrection(TypicalLEDStrip);
  FastLED.clear();              // clear the ledstrip
  fill_solid( leds, NUM_LEDS, CRGB(80,1,1));
  leds[0] = CRGB(80, 0, 0);
  FastLED.show();

  //setup rest
  Serial.begin(115200);
  h.PrintLn("starting 1");
}

void loop()
{
  delay(1000);
<<<<<<< HEAD
  fill_solid( leds, NUM_LEDS, CRGB(80,1,1));
  FastLED.show();
  delay(1000);
=======
  fill_solid( leds, NUM_LEDS, CRGB(80,80,80));
  FastLED.show();
  delay(1000);
