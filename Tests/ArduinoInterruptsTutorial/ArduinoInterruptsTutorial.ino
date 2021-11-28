volatile boolean ledOn = false;

void setup() {
  pinMode(13,OUTPUT);
  pinMode(2,INPUT);
  attachInterrupt(0,buttonPressed,RISING);
}

void loop() {
  
}

void buttonPressed()
{
  if(ledOn)
  {
    ledOn = false;
    digitalWrite(13,LOW);
  }else
  {
    ledOn = true;
    digitalWrite(13,HIGH);
  }
}



