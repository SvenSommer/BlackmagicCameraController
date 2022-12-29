#include <BMDSDIControl.h>                                // need to include the library


BMD_SDITallyControl_I2C sdiTallyControl(0x6E);            // define the Tally object using I2C using the default shield address
BMD_SDICameraControl_I2C sdiCameraControl(0x6E);

// the setup function runs once when you press reset or power the board
void setup()
{
  sdiTallyControl.begin();                                 // initialize tally control
  sdiCameraControl.begin();

  sdiTallyControl.setOverride(true);                       // enable tally override
  sdiCameraControl.setOverride(true);                       // enable tally override


  pinMode(13, OUTPUT);                                     // initialize digital pin 13 as an output
}

// the loop function runs over and over again forever
void loop()
{
  digitalWrite(13, HIGH);                                  // turn the LED ON

  sdiTallyControl.setCameraTally(                          // turn tally ON
    1,                                                     // Camera Number
    true,                                                  // Program Tally
    false                                                  // Preview Tally
  );

  delay(1000);                                             // leave it ON for 1 second

  digitalWrite(13, LOW);                                   // turn the LED OFF

  sdiTallyControl.setCameraTally(                          // turn tally OFF
    1,                                                      // Camera Number
    false,                                                 // Program Tally
    false                                                  // Preview Tally
  );

  delay(1000);                                             // leave it OFF for 1 second
}
