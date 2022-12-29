import json

from parameterHandler import ParameterHandler
from models.command import Command
from display import Display
from controller.serial import SerialController

def getCamera(command: Command) -> int:
    display.showHeader(command)
    try:
        camera_number = int(input("Which camera do you want to control? CameraIndex?"))
        command.setCamera(camera_number)
        return command

    except ValueError:
        print("Not a number")
        exit(1)

def getGroup(json_data, command: Command) -> int:
    display.showHeader(command)
    i=0
    print("Commands from following groups are available:")
    for group in json_data['groups']:
        print("{0}. {1}".format(i+1,group['name']))
        i=i+1

    try:
        print("---------------------------")
        group_input = int(input("From which group do you want to send a command?"))
        command.setGroup(group_input - 1, json_data['groups'][group_input - 1]["name"])
        return command

    except ValueError:
        print("Not a number")
        exit(1)

def getParameter(json_data, command: Command) -> int:
    display.showHeader(command)
    j=0
    for parameter in json_data['groups'][command.groupId]['parameters']:
        print("{0}. {1}".format(j+1,parameter['parameter']))
        j=j+1

    try:
        print("---------------------------")
        parameter_input =  int(input("What do you want to control in the group {0}?".format(json_data['groups'][command.groupId]['name'])))
        parameter = json_data['groups'][command.groupId]['parameters'][parameter_input-1]
        command.setParameter(parameter_input-1,parameter["parameter"],parameter["type"],parameter["index"] )
        return command

    except ValueError:
        print("Not a number")
        exit(1)

def getParameterValue(json_data, command: Command) ->Command :
    display.showHeader(command)
    paramHandler = ParameterHandler(json_data['groups'][command.groupId]['parameters'][command.parameter.id])
    command = paramHandler.handleParam(command)
    return command

def checkCommand(command: Command):
    display.showHeader(command)
    if command.parameter.value is not None:
        return True
    if command.parameter.values != []:
        return True
    _ = input("Error: Command has no valid value!")
    return False

def sendCommand(command: Command):
    display.showHeader(command)
    if checkCommand(command):
        serialController.sendCommand(command)
        _ = input("Command sent")

def renderCommandMenue():
    with open('PROTOCOL.json', encoding="utf8") as json_file:
        json_data = json.loads(json_file.read())    
    command = Command()
    getCamera(command)
    getGroup(json_data, command)
    getParameter(json_data, command)
    getParameterValue(json_data, command)
    display.showMenue(command)
    menue_input = 1
    while menue_input != 0:
        display.showMenue(command)
        menue_input = int(input("What do you want to do?"))
        if menue_input == 1:
            getCamera(command)
        elif menue_input == 2:
            command.resetGroup()
            getGroup(json_data, command)
            getParameter(json_data, command)
            getParameterValue(json_data, command)
        elif menue_input == 3:
            command.resetParameter()
            getParameter(json_data, command)
            getParameterValue(json_data, command)
        elif menue_input == 4:
            command.resetValue()
            getParameterValue(json_data, command)
        elif menue_input == 5:
            sendCommand(command)

display = Display()
serialController = SerialController()
if __name__ == '__main__':
    display.showHeader()
    ports = []
    ports = serialController.getSerialPorts()
    while len(ports) == 0:
        print("Scanning for Devices connected to this PC....")
        ports = serialController.getSerialPorts()
        input("No connected devices found. Please connect the arduino with appended the blackmagic sdk board to this pc. Hit 'Ctrl' + 'c' to exit.")
    
    
    portid = 0
    if len(ports) > 1:
        print("Found {0} devices connected to this pc:".format(len(ports)))
        i = 1
        for port in ports:
            print("{0}: {1}".format(i, port ))
            i=i+1
        portid = int(input("Please choose a device you want to connect to:")) - 1
        if portid > len(ports) or portid < 0:
            print("ERROR: Device not available")
    
    connection = serialController.connect(portid)
    display.showHeader(connection=connection)
    renderCommandMenue()
