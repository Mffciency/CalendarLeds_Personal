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
/* 

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h> */

#define FASTLED_INTERRUPT_RETRY_COUNT 0
#define FASTLED_ESP8266_RAW_PIN_ORDER
#define FASTLED_ALLOW_INTERRUPTS 0
#include <FastLED.h>

FASTLED_USING_NAMESPACE

// fastled setup
#if defined(FASTLED_VERSION) && (FASTLED_VERSION < 3001000)
#warning "Requires FastLED 3.1 or later; check github for latest code."
#endif
#define DATA_PIN    4

#define LED_TYPE WS2812B
#define COLOR_ORDER GRB
#define NUM_LEDS 144
CRGB leds[NUM_LEDS];
CRGB prevleds[NUM_LEDS];

#define BRIGHTNESS 80
const int LOWBRIGHTNESS = BRIGHTNESS - 45;
const int HIGHBRIGHTNESS = BRIGHTNESS + 80;
#define FRAMES_PER_SECOND 60


void setup()
{
  FastLED.addLeds<LED_TYPE, DATA_PIN, COLOR_ORDER>(leds, NUM_LEDS).setCorrection(TypicalLEDStrip);
  FastLED.clear();              // clear the ledstrip
  fill_solid( leds, NUM_LEDS, CRGB(80,80,80));
  leds[0] = CRGB(80, 0, 0);
  FastLED.show();

  //setup rest
  Serial.begin(115200);
  h.PrintLn("starting 1");
}

void loop()
{
  delay(1000);
  fill_solid( leds, NUM_LEDS, CRGB(80,80,80));
  FastLED.show();
  delay(1000);
  leds[0] = CRGB(80, 0, 0);
  FastLED.show();
  h.PrintLn("full"); 
}
