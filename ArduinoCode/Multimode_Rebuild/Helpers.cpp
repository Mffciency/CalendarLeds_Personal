#include "Helpers.h"

Helpers::Helpers()
{
    
}



void PrintLn(String str)
{
    bool showUpdates = true;
    if (showUpdates)
    {
        Serial.println(str);
    }
}

void Print(String str)
{
    bool showUpdates = true;
    if (showUpdates)
    {
        Serial.print(str);
    }
}
