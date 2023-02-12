#include <BMDSDIControl.h>

/**
 *  Blackmagic Design 3G-SDI Shield Example Sketch
 *    Shield Info Example
 *
 *  This sketch extracts out the various version identifiers from the
 *  Blackmagic Design 3G-SDI Shield control library and hardware.
 *
 *  The version information of the shield and library should be printed to
 *  the serial port when run.
 *
 *  Setup Steps:
 *    1) Connect the Blackmagic Design 3G-SDI Shield to an Arduino board.
 *    2) Build and run the example sketch.
 *    3) Observe the information printed on the Serial Monitor.
 */

const int shieldAddress = 0x6E;
BMD_SDITallyControl_I2C sdiTallyControl(shieldAddress);
BMD_SDICameraControl_I2C sdiCameraControl(shieldAddress);

const byte numChars = 128;
char receivedChars[numChars];
char tempChars[numChars];        // temporary array for use when parsing

      // variables to hold the parsed data
int commandType = 0;
int tallyCameraId = 0;
int tallyCameraActive = 0;
int tallyPreview = 0;
int cameraId = 0;
int groupId = 0;
int paramId = 0;
char paramType[numChars] = {0};
char stringValues[numChars] = {0}; 
int valuesLength = 0;
char buffer[numChars] = {0};

float value = 0.0;
float values[64] = {};

boolean newData = false;

void setup() {
  Serial.begin(115200);
  sdiTallyControl.begin();
  sdiCameraControl.begin();

  Wire.setClock(400000);
  //sentShieldInfo();

    // Enable both tally and control overrides
  sdiTallyControl.setOverride(true);
  sdiCameraControl.setOverride(true);

}

void loop() {
  recvWithStartEndMarkers();
  if (newData == true) {
      strcpy(tempChars, receivedChars);
          // this temporary copy is necessary to protect the original data
          //   because strtok() used in parseData() replaces the commas with \0
      parseData();
      newData = false;
  }

}

void recvWithStartEndMarkers() {
    static boolean recvInProgress = false;
    static byte ndx = 0;
    char startMarker = '{';
    char endMarker = '}';
    char rc;

    while (Serial.available() > 0 && newData == false) {
        rc = Serial.read();

        if (recvInProgress == true) {
            if (rc != endMarker) {
                receivedChars[ndx] = rc;
                ndx++;
                if (ndx >= numChars) {
                    ndx = numChars - 1;
                }
            }
            else {
                receivedChars[ndx] = '\0'; // terminate the string
                recvInProgress = false;
                ndx = 0;
                newData = true;
            }
        }
        else if (rc == startMarker) {
            recvInProgress = true;
        }
    }
}

//============

void parseData() {      // split the data into its parts
    //1,1,0,int8,[3, 2, 1, 3, 2]
    //1 = tallyCommand
    //2 = other command

    char * strtokIndx; // this is used by strtok() as an index
    char * strtokIndx2;
    strtokIndx = strtok(tempChars,",");    
    commandType = atoi(strtokIndx);
    if (commandType == 1){
      strtokIndx = strtok(NULL,",");    
      tallyCameraId = atoi(strtokIndx); 

      strtokIndx = strtok(NULL,",");    
      tallyCameraActive = atoi(strtokIndx); 

      strtokIndx = strtok(NULL,","); 
      tallyPreview = atoi(strtokIndx);   

      //showTallyCommand();
      sendTallyCommmand();

    }
    else if (commandType == 2) {
      strtokIndx = strtok(NULL,",");    
      cameraId = atoi(strtokIndx); 

      strtokIndx = strtok(NULL,","); 
      groupId = atoi(strtokIndx);   

      strtokIndx = strtok(NULL,",");   
      paramId = atoi(strtokIndx);   

      strtokIndx = strtok(NULL,",");      
      strcpy(paramType, strtokIndx); 

      strtokIndx = strtok(NULL, ","); 
      valuesLength = atoi(strtokIndx);  

      if(strcmp(paramType,"string") == 0) {        
        strtokIndx = strtok(NULL, ""); 
        strcpy(stringValues, strtokIndx);     
 
      }else {
          if (valuesLength == 0) {
          strtokIndx = strtok(NULL,",");   
          value = atof(strtokIndx);   
        } else {
          strtokIndx = strtok(NULL,"");     
          strcpy(buffer, strtokIndx); 
          strtokIndx2 = strtok(buffer,",");
          int i = 0;  
          while( strtokIndx2 != NULL )
          {
            values[i++] = atof(strtokIndx2);
            strtokIndx2 = strtok( NULL, ",");
          } 
        }
      }
    //showGeneralCommand();
    sendGeneralCommmand();
    }
}

//============

void showTallyCommand() {
  Serial.println("");
  Serial.println("Received Tally Command:");
  Serial.print("tallyCameraId: ");
  Serial.println(tallyCameraId);
  Serial.print("tallyCameraActive: ");
  Serial.println(tallyCameraActive);
  Serial.print("tallyPreview: ");
  Serial.println(tallyPreview);
}


void sendTallyCommmand() {
    bool preview = tallyPreview == 1;
    bool active = tallyCameraActive == 1;

    // Send new tally state to the camera
    sdiTallyControl.setCameraTally(
        tallyCameraId,                   // Camera Number
        active,       // Program Tally
        preview                // Preview Tally
      );
}

void showGeneralCommand() {
  Serial.println("");
  Serial.println("Received General Command:");
  Serial.print("cameraId: ");
  Serial.println(cameraId);
  Serial.print("groupId: ");
  Serial.println(groupId);
  Serial.print("paramId: ");
  Serial.println(paramId);
  Serial.print("paramType: ");
  Serial.println(paramType);
  Serial.print("value: ");
  Serial.println(value);
  Serial.print("valuesLength: ");
  Serial.println(valuesLength);
  Serial.print("stringValues: ");
  Serial.println(stringValues);
  Serial.print("values: ");
  int i= 0;
  for (i=0;i < valuesLength;i++) {
    Serial.println(values[i]);
  }
}

void sendGeneralCommmand() {
  if (strcmp(paramType,"void") == 0){
    sdiCameraControl.writeCommandVoid(
        cameraId,                   // Destination:   
        groupId,                   // Category:       
        paramId                    // Param:          
      );
  }
  else if (strcmp(paramType,"boolean") == 0){
    bool bvalue = value == 1;
    sdiCameraControl.writeCommandBool(cameraId, groupId, paramId, 0, bvalue);
  }
  else if (strcmp(paramType,"int8") == 0){
    if (valuesLength == 0) {
      sdiCameraControl.writeCommandInt8(cameraId, groupId, paramId, 0, value);
    } else {
      float arrvalues[valuesLength-1];
      int i= 0;
      for (i=0;i < valuesLength;i++) {
        arrvalues[i] = values[i];
      }
      sdiCameraControl.writeCommandInt8(cameraId, groupId, paramId, 0, *arrvalues);
    }
  }
  else if (strcmp(paramType,"int16") == 0){
    if (valuesLength == 0) {
      sdiCameraControl.writeCommandInt16(cameraId, groupId, paramId, 0, value);
    } else {
      float arrvalues[valuesLength-1];
      int i= 0;
      for (i=0;i < valuesLength;i++) {
        arrvalues[i] = values[i];
      }
      sdiCameraControl.writeCommandInt16(cameraId, groupId, paramId, 0, *arrvalues);
    }
  }
  else if (strcmp(paramType,"int32") == 0){
    if (valuesLength == 0) {
      sdiCameraControl.writeCommandInt32(cameraId, groupId, paramId, 0, value);
    } else {
      float arrvalues[valuesLength-1];
      int i= 0;
      for (i=0;i < valuesLength;i++) {
        arrvalues[i] = values[i];
      }
      sdiCameraControl.writeCommandInt32(cameraId, groupId, paramId, 0, *arrvalues);
    }
  }
  else if (strcmp(paramType,"int64") == 0){
    if (valuesLength == 0) {
      sdiCameraControl.writeCommandInt64(cameraId, groupId, paramId, 0, value);
    } else {
      float arrvalues[valuesLength-1];
      int i= 0;
      for (i=0;i < valuesLength;i++) {
        arrvalues[i] = values[i];
      }
      sdiCameraControl.writeCommandInt64(cameraId, groupId, paramId, 0, *arrvalues);
    }
  }
  else if (strcmp(paramType,"string") == 0){
      char* tempStringValues[valuesLength-1];
      int i= 0;
      for (i=0;i < valuesLength;i++) {
        tempStringValues[i] = stringValues[i];
      }
    sdiCameraControl.writeCommandUTF8(cameraId, groupId, paramId, 0, *tempStringValues);
  }
  else if (strcmp(paramType,"fixed16") == 0){
    if (valuesLength == 0) {
      sdiCameraControl.writeCommandFixed16(cameraId, groupId, paramId, 0, value);
      } else {
      float arrvalues[valuesLength-1];
      int i= 0;
      for (i=0;i < valuesLength;i++) {
        arrvalues[i] = values[i];
      }
      sdiCameraControl.writeCommandFixed16(cameraId, groupId, paramId, 0, *arrvalues);
    }
  }
}


void sentShieldInfo() {
  Serial.println("Blackmagic Design SDI Control Shield");

  Serial.print("Getting shield version info...");

  Serial.println("done.\n");

  // Show BMD SDI Control Shield for Arduino library version
  BMD_Version libraryVersion = sdiCameraControl.getLibraryVersion();
  Serial.print("Library Version:\t");
  Serial.print(libraryVersion.Major);
  Serial.print('.');
  Serial.println(libraryVersion.Minor);

  // Show shield firmware version
  BMD_Version firmwareVersion = sdiCameraControl.getFirmwareVersion();
  Serial.print("Firmware Version:\t");
  Serial.print(firmwareVersion.Major);
  Serial.print('.');
  Serial.println(firmwareVersion.Minor);

  // Show shield protocol version
  BMD_Version protocolVersion = sdiCameraControl.getProtocolVersion();
  Serial.print("Protocol Version:\t");
  Serial.print(protocolVersion.Major);
  Serial.print('.');
  Serial.println(protocolVersion.Minor);
  Serial.println("#############################");
  Serial.println("Firmware: v0.1");
  Serial.println("Ready to receive commands.");
}