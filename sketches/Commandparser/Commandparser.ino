#include <BMDSDIControl.h>
#include "cppQueue.h"

const int shieldAddress = 0x6E;
BMD_SDITallyControl_I2C sdiTallyControl(shieldAddress);
BMD_SDICameraControl_I2C sdiCameraControl(shieldAddress);

const byte numChars = 128;
const int queueSize = 10;

cppQueue messageQueue(sizeof(String), queueSize, FIFO, false);

void setup()
{
  Serial.begin(115200);
  sdiTallyControl.begin();
  sdiCameraControl.begin();

  Wire.setClock(400000);
  sdiTallyControl.setOverride(true);
  sdiCameraControl.setOverride(true);
}

void loop()
{
  char receivedChars[numChars];
  bool newData = recvWithStartEndMarkers(receivedChars, numChars);
  if (newData)
  {
    String message = String(receivedChars);
    if (!messageQueue.push(&message)) {
      // Handle the case where the queue is full and the message cannot be added
    }
  }

  if (!messageQueue.isEmpty())
  {
    processNextMessage();
  }
}

void processNextMessage()
{
  if (messageQueue.isEmpty())
  {
    return;
  }

  String message;
  if (messageQueue.pop(&message)) {
    parseData(message.c_str());
  } else {
    // Handle the case where the queue is empty and there are no messages to process
  }
}

bool recvWithStartEndMarkers(char *receivedChars, int maxChars)
{
  static boolean recvInProgress = false;
  static byte ndx = 0;
  char startMarker = '{';
  char endMarker = '}';
  char rc;

  while (Serial.available() > 0)
  {
    rc = Serial.read();

    if (recvInProgress)
    {
      if (rc != endMarker)
      {
        receivedChars[ndx] = rc;
        ndx++;
        if (ndx >= maxChars)
        {
          ndx = maxChars - 1;
        }
      }
      else
      {
        receivedChars[ndx] = '\0'; // terminate the string
        recvInProgress = false;
        ndx = 0;
        return true;
      }
    }
    else if (rc == startMarker)
    {
      recvInProgress = true;
    }
  }
  return false;
}

void parseData(const char *receivedChars)
{
  char tempChars[numChars];
  strcpy(tempChars, receivedChars);

  int commandType = atoi(strtok(tempChars, ","));

  if (commandType == 1)
  {
    parseTallyCommand();
  }
  else if (commandType == 2)
  {
    parseGeneralCommand();
  }
}

void parseTallyCommand()
{
  int tallyCameraId = atoi(strtok(NULL, ","));
  int tallyCameraActive = atoi(strtok(NULL, ","));
  int tallyPreview = atoi(strtok(NULL, ","));
  sendTallyCommmand(tallyCameraId, tallyCameraActive, tallyPreview);
}

void parseGeneralCommand()
{
  int cameraId = atoi(strtok(NULL, ","));
  int groupId = atoi(strtok(NULL, ","));
  int paramId = atoi(strtok(NULL, ","));
  char paramType[numChars];
  strcpy(paramType, strtok(NULL, ","));
  int valuesLength = atoi(strtok(NULL, ","));

  if (strcmp(paramType, "string") == 0)
  {
    char stringValues[numChars];
    strcpy(stringValues, strtok(NULL, ""));
    sendGeneralCommmand(cameraId, groupId, paramId, paramType, valuesLength, NULL, stringValues);
  }
  else
  {
    float values[valuesLength];
    if (valuesLength == 0)
    {
      values[0] = atof(strtok(NULL, ","));
    }
    else
    {
      char buffer[numChars];
      strcpy(buffer, strtok(NULL, ""));
      char *strtokIndx2 = strtok(buffer, ",");
      int i = 0;
      while (strtokIndx2 != NULL)
      {
        values[i++] = atof(strtokIndx2);
        strtokIndx2 = strtok(NULL, ",");
      }
    }
    sendGeneralCommmand(cameraId, groupId, paramId, paramType, valuesLength, values, NULL);
  }
}

void sendTallyCommmand(int tallyCameraId, int tallyCameraActive, int tallyPreview)
{
  bool preview = tallyPreview == 1;
  bool active = tallyCameraActive == 1;

  // Send new tally state to the camera
  sdiTallyControl.setCameraTally(
      tallyCameraId, // Camera Number
      active,        // Program Tally
      preview        // Preview Tally
  );
}

void sendGeneralCommmand(int cameraId, int groupId, int paramId, const char *paramType, int valuesLength, float *values, const char *stringValues)
{
  if (strcmp(paramType, "string") == 0)
  {
    sdiCameraControl.writeCommandUTF8(cameraId, groupId, paramId,0, stringValues);
    return;
  }

  float value = (valuesLength == 0) ? values[0] : *values;

  if (strcmp(paramType, "void") == 0)
  {
    sdiCameraControl.writeCommandVoid(cameraId, groupId, paramId);
  }
  else if (strcmp(paramType, "boolean") == 0)
  {
    sdiCameraControl.writeCommandBool(cameraId, groupId, paramId,0, value == 1);
  }
  else if (strcmp(paramType, "int8") == 0)
  {
    sdiCameraControl.writeCommandInt8(cameraId, groupId, paramId,0, static_cast<int8_t>(value));
  }
  else if (strcmp(paramType, "int16") == 0)
  {
    sdiCameraControl.writeCommandInt16(cameraId, groupId, paramId,0, static_cast<int16_t>(value));
  }
  else if (strcmp(paramType, "int32") == 0)
  {
    sdiCameraControl.writeCommandInt32(cameraId, groupId, paramId,0, static_cast<int32_t>(value));
  }
  else if (strcmp(paramType, "int64") == 0)
  {
    sdiCameraControl.writeCommandInt64(cameraId, groupId, paramId,0, static_cast<int64_t>(value));
  }
  else if (strcmp(paramType, "fixed16") == 0)
  {
    sdiCameraControl.writeCommandFixed16(cameraId, groupId, paramId,0, value);
  }
}
