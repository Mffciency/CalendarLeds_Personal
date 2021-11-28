#ifndef HELPERS_H
#define HELPERS_H

#if (ARDUINO >=100)
  #include "Arduino.h"
#else
  #include "WProgram.h"
#endif

class Helpers
{
private:
    /* data */
public:
    void PrintLn(String str);
    void PrintL(String str);
};



#endif