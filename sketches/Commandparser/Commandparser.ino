#include <BMDSDIControl.h>

const int shieldAddress = 0x6E;
BMD_SDITallyControl_I2C sdiTallyControl(shieldAddress);
BMD_SDICameraControl_I2C sdiCameraControl(shieldAddress);
const byte numChars = 128;
char receivedChars[numChars];
char tempChars[numChars];
static bool verboseMode = false;


enum CommandType
{
  Tally = 1,
  General = 2
};

struct CommandData
{
  int commandType;
  int tallyCameraId;
  int tallyCameraActive;
  int tallyPreview;
  int cameraId;
  int groupId;
  int paramId;
  char paramType[numChars];
  char stringValues[numChars];
  int valuesLength;
  float value;
  float values[64];
};

CommandData cmdData;
boolean newData = false;

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
  recvWithStartEndMarkers();
  if (newData == true)
  {
    strcpy(tempChars, receivedChars);
    if (validateChecksum(tempChars))
    {
      parseData(tempChars, cmdData);
      executeCommand(cmdData);
    }
    newData = false;
  }
}

void recvWithStartEndMarkers()
{
  static boolean recvInProgress = false;
  static byte ndx = 0;
  char startMarker = '{';
  char endMarker = '}';
  char rc;

  while (Serial.available() > 0 && newData == false)
  {
    rc = Serial.read();

    if (recvInProgress == true)
    {
      if (rc != endMarker)
      {
        receivedChars[ndx] = rc;
        ndx++;
        if (ndx >= numChars)
        {
          ndx = numChars - 1;
        }
      }
      else
      {
        receivedChars[ndx] = '\0'; // terminate the string
        recvInProgress = false;
        ndx = 0;
        newData = true;
      }
    }
    else if (rc == startMarker)
    {
      recvInProgress = true;
    }
  }
}

bool validateChecksum(char *inputChars)
{

  char *checksum_ptr = strrchr(inputChars, '*');
  if (checksum_ptr == NULL)
  {
    if (verboseMode)
    {
      Serial.println("Error: Checksum not found");
    }
    return false;
  }

  *checksum_ptr = '\0';
  int received_checksum = atoi(checksum_ptr + 1);

  int calculated_checksum = 0;
  for (char *p = inputChars; *p != '\0'; p++)
  {
    calculated_checksum += *p;
  }
  calculated_checksum %= 256;

  if (calculated_checksum != received_checksum)
  {
    if (verboseMode)
    {
      Serial.print("Checksum mismatch: received ");
      Serial.print(received_checksum);
      Serial.print(", calculated ");
      Serial.println(calculated_checksum);
    }
    return false;
  }

  // Remove the checksum part from the string
  *checksum_ptr = '\0';

  return true;
}

void parseData(char *inputChars, CommandData &cmdData)
{
  char *token;
  char *subToken;

  token = strtok(inputChars, ",");
  cmdData.commandType = atoi(token);

  token = strtok(NULL, ",");
  int cameraId = atoi(token);

  if (cmdData.commandType == CommandType::Tally)
  {
    cmdData.tallyCameraId = cameraId;

    token = strtok(NULL, ",");
    cmdData.tallyCameraActive = atoi(token);

    token = strtok(NULL, ",");
    cmdData.tallyPreview = atoi(token);
  }
  else if (cmdData.commandType == CommandType::General)
  {
    cmdData.cameraId = cameraId;

    token = strtok(NULL, ",");
    cmdData.groupId = atoi(token);

    token = strtok(NULL, ",");
    cmdData.paramId = atoi(token);

    token = strtok(NULL, ",");
    strcpy(cmdData.paramType, token);

    token = strtok(NULL, ",");
    cmdData.valuesLength = atoi(token);

    if (strcmp(cmdData.paramType, "string") == 0)
    {
      token = strtok(NULL, "");
      strcpy(cmdData.stringValues, token);
    }
    else
    {
      if (cmdData.valuesLength == 0)
      {
        token = strtok(NULL, ",");
        cmdData.value = atof(token);
      }
      else
      {
        token = strtok(NULL, "");
        strcpy(tempChars, token);
        subToken = strtok(tempChars, ",");
        int i = 0;
        while (subToken != NULL)
        {
          cmdData.values[i++] = atof(subToken);
          subToken = strtok(NULL, ",");
        }
      }
    }
  }
}

void executeCommand(CommandData &cmdData)
{
  switch (cmdData.commandType)
  {
  case CommandType::Tally:
    executeTallyCommand(cmdData);
    break;
  case CommandType::General:
    executeGeneralCommand(cmdData);
    break;
  default:
    // Handle unknown command type
    break;
  }
}

void executeTallyCommand(CommandData &cmdData)
{
  bool preview = cmdData.tallyPreview == 1;
  bool active = cmdData.tallyCameraActive == 1;

  // Send new tally state to the camera
  sdiTallyControl.setCameraTally(
      cmdData.tallyCameraId, // Camera Number
      active,                // Program Tally
      preview                // Preview Tally
  );
}

void executeGeneralCommand(CommandData &cmdData)
{
  // Check if the system is ready for a new command
  if (!sdiCameraControl.availableForWrite())
  {
    if (verboseMode)
    {
      // Log or handle the situation when the system is not ready
      Serial.println("System not ready for new command");
    }
    return;
  }

  if (strcmp(cmdData.paramType, "void") == 0)
  {
    sdiCameraControl.writeCommandVoid(cmdData.cameraId, cmdData.groupId, cmdData.paramId);
  }
  else if (strcmp(cmdData.paramType, "boolean") == 0)
  {
    bool bvalue = cmdData.value == 1;
    sdiCameraControl.writeCommandBool(cmdData.cameraId, cmdData.groupId, cmdData.paramId, 0, bvalue);
  }
  else if (strcmp(cmdData.paramType, "int8") == 0)
  {
    if (cmdData.valuesLength == 0)
    {
      sdiCameraControl.writeCommandInt8(cmdData.cameraId, cmdData.groupId, cmdData.paramId, 0, cmdData.value);
    }
    else
    {
      sdiCameraControl.writeCommandInt8(cmdData.cameraId, cmdData.groupId, cmdData.paramId, 0, *cmdData.values);
    }
  }
  else if (strcmp(cmdData.paramType, "int16") == 0)
  {
    if (cmdData.valuesLength == 0)
    {
      sdiCameraControl.writeCommandInt16(cmdData.cameraId, cmdData.groupId, cmdData.paramId, 0, cmdData.value);
    }
    else
    {
      sdiCameraControl.writeCommandInt16(cmdData.cameraId, cmdData.groupId, cmdData.paramId, 0, *cmdData.values);
    }
  }
  else if (strcmp(cmdData.paramType, "int32") == 0)
  {
    if (cmdData.valuesLength == 0)
    {
      sdiCameraControl.writeCommandInt32(cmdData.cameraId, cmdData.groupId, cmdData.paramId, 0, cmdData.value);
    }
    else
    {
      sdiCameraControl.writeCommandInt32(cmdData.cameraId, cmdData.groupId, cmdData.paramId, 0, *cmdData.values);
    }
  }
  else if (strcmp(cmdData.paramType, "int64") == 0)
  {
    if (cmdData.valuesLength == 0)
    {
      sdiCameraControl.writeCommandInt64(cmdData.cameraId, cmdData.groupId, cmdData.paramId, 0, cmdData.value);
    }
    else
    {
      sdiCameraControl.writeCommandInt64(cmdData.cameraId, cmdData.groupId, cmdData.paramId, 0, *cmdData.values);
    }
  }
  else if (strcmp(cmdData.paramType, "string") == 0)
  {
    sdiCameraControl.writeCommandUTF8(cmdData.cameraId, cmdData.groupId, cmdData.paramId, 0, *cmdData.stringValues);
  }
  else if (strcmp(cmdData.paramType, "fixed16") == 0)
  {
    if (cmdData.valuesLength == 0)
    {
      sdiCameraControl.writeCommandFixed16(cmdData.cameraId, cmdData.groupId, cmdData.paramId, 0, cmdData.value);
    }
    else
    {
      sdiCameraControl.writeCommandFixed16(cmdData.cameraId, cmdData.groupId, cmdData.paramId, 0, *cmdData.values);
    }
  }

  if (verboseMode)
  {
    // Log the command sent
    Serial.print("Command sent to camera ");
    Serial.print(cmdData.cameraId);
    Serial.print(" with parameter type ");
    Serial.println(cmdData.paramType);
  }
  // Introduce a small delay to ensure commands don't overlap
  delay(100); // Adjust the delay as needed
}