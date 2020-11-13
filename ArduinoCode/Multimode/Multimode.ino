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

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>

#define FASTLED_INTERRUPT_RETRY_COUNT 0
#define FASTLED_ESP8266_RAW_PIN_ORDER
#define FASTLED_ALLOW_INTERRUPTS 0
#include <FastLED.h>

FASTLED_USING_NAMESPACE

// fastled setup
#if defined(FASTLED_VERSION) && (FASTLED_VERSION < 3001000)
#warning "Requires FastLED 3.1 or later; check github for latest code."
#endif
#define DATA_PIN 5
#define LED_TYPE WS2812B
#define COLOR_ORDER GRB
#define NUM_LEDS 144
CRGB leds[NUM_LEDS];

#define BRIGHTNESS 80
const int LOWBRIGHTNESS = BRIGHTNESS - 45;
const int HIGHBRIGHTNESS = BRIGHTNESS + 80;
#define FRAMES_PER_SECOND 60

uint8_t gHue = 0; // rotating "base color" used by many of the patterns

// Wifi setup
WifiLib tel(true);

const char *ssid = tel.getSsid();
const char *password = tel.getPass();
const char *website = tel.getSite(1);
const int mode = tel.getMode();
const char *token = tel.getToken();

String useWebsite = String(website);
String useToken = String(token);

// Different modes
int useMode = mode;
/*
1 : show set slowly
2 : show set instant
3 : hartbeat
4 : flash between set of colors
5 : update one led, no reset
*/

// json conversion setup
uint8_t Ary[432];
uint8_t i = 0, j = 0;

#define ARRAY_SIZE(array) ((sizeof(array)) / (sizeof(array[0])))

// general setup
bool showUpdates = true;
double refreshRate = 1; // how many times per minute does a webcall need to go out

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

void CallWebsite()
{
  // call the website to get an array of RGB values in return

  if (WiFi.status() == WL_CONNECTED)
  {                  //Check WiFi connection status
    HTTPClient http; //Declare an object of class HTTPClient
    String call = String(useWebsite) + "?token=" + String(token);
    PrintLn(String(call));
    http.begin(call); //Specify request destination

    PrintLn("reaching site");
    int httpCode = http.GET(); //Send the request
    if (httpCode > 0)
    { //Check the returning code
      PrintLn(String(httpCode));
      String payload = http.getString(); //Get the request response payload
      PrintLn(payload);

      PrintLn("payload above"); //Print the response payload
      StringToJson(payload);
    }
    else
    {
      PrintLn("failed");
      String payload = http.getString(); //Get the request response payload
      PrintLn(payload);
    }
    http.end(); //Close connection
  }
}

void StringToJson(String textIn)
{
  // convert the string into a json document.
  DynamicJsonDocument doc(13999);
  deserializeJson(doc, textIn);
  JsonObject obj = doc.as<JsonObject>();
  JsonToMode(obj);
  JsonToFastled(obj);
  JsonToRefreshRate(obj);
  JsonToWebsite(obj);
}

void JsonToFastled(JsonObject obj)
{
  // put the values of the json document into the ledstring
  if (useMode == 3)
  {
    return;
  }
  if (useMode == 4)
  {
    
    JsonArray array = obj[String("LedSequence")];
    int arraysize = array.size();
    Serial.println(array.size()); // 2
    for (int i = 0; i < arraysize; i++)
    {
      int R = obj[String("LedSequence")][i][0];
      int G = obj[String("LedSequence")][i][1];
      int B = obj[String("LedSequence")][i][2];
      fill_solid(leds, NUM_LEDS, CRGB(R, G, B));
      FastLED.show();
      Serial.print("leds:");
      Serial.print(leds[0]);
      Serial.print(leds[1]);
      Serial.print(leds[2]);
      Serial.print(leds[143]);
      Serial.println(leds[144]);
      delay(50);
    }  
    
    return;
  }
  if (useMode == 5)
  {
      int pos = obj[String("LedSequence")][0][0];
      int R = obj[String("LedSequence")][1][0];
      int G = obj[String("LedSequence")][1][1];
      int B = obj[String("LedSequence")][1][2];
      leds[pos] = CRGB(R, G, B);
      FastLED.show();
      Serial.print("leds:");
      Serial.print(leds[0]);
      Serial.print(leds[1]);
      Serial.print(leds[2]);
      Serial.print(leds[143]);
      Serial.println(leds[144]);
      
    
    return;
  }
  for (int i = 0; i < 144; i++)
  {
    int R = obj[String("LedSequence")][i][0];
    int G = obj[String("LedSequence")][i][1];
    int B = obj[String("LedSequence")][i][2];
    leds[i] = CRGB(R, G, B);
    //Print(String(R));
    //Print(String(G));
    //PrintLn(String(B));
    if (useMode == 1 || useMode == 0)
    {
      FastLED.show();
      delay(30);
    }
  }
  if (useMode == 2)
  {
    FastLED.show();
  }
  Serial.print("leds:");
  Serial.print(leds[0]);
  Serial.print(leds[1]);
  Serial.print(leds[2]);
  Serial.print(leds[143]);
  Serial.println(leds[144]);
}

void JsonToRefreshRate(JsonObject obj)
{
  refreshRate = obj[String("refreshRate")];
  Print("refreshrate: ");
  PrintLn(String(refreshRate));
}

void JsonToWebsite(JsonObject obj)
{
  useWebsite = obj[String("website")].as<String>();
  Print("website: ");
  PrintLn(useWebsite);
}

void JsonToMode(JsonObject obj)
{
  useMode = obj[String("mode")];
  Print("mode: ");
  PrintLn(String(useMode));
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
void setup()
{
  // setup leds
  FastLED.addLeds<LED_TYPE, DATA_PIN, COLOR_ORDER>(leds, NUM_LEDS).setCorrection(TypicalLEDStrip);
  FastLED.clear();              // clear the ledstrip
  leds[0] = CRGB(50, 100, 150); // to indicate the ledstrip / arduino is running
  FastLED.show();

  //setup rest
  Serial.begin(115200);
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
  CallWebsite();
}

void loop()
{
  delay(60000 / refreshRate); //Send a request every 60 seconds
  if (useMode == 3)
  {
    
    bpm();
  }
  CallWebsite();
}
