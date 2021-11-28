#include "LowPower.h"

void setup() {
  pinMode(13,OUTPUT);
  pinMode(2,INPUT);
  pinMode(3,INPUT);
  attachInterrupt(0,turnLEDOn,RISING);
  attachInterrupt(1,turnLEDOff,FALLING);
}

void loop() {

 LowPower.powerDown(SLEEP_FOREVER , ADC_OFF, BOD_OFF); 
}

void turnLEDOn()
{
  digitalWrite(13,HIGH);
}

void turnLEDOff()
{
  digitalWrite(13,LOW);
}



