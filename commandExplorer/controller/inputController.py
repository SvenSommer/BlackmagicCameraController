from models.command import Command
from controller.parameterHandler import ParameterHandler

class InputController():
    def __init__(self, protocol) -> None:
        self.protocol = protocol
        self.command = Command()
    
    def initial_input(self):
        self.reset_camera()
        self.get_group()
        self.get_parameter()
        self.get_parameter_value()
        
    def reset_group(self):
        self.command.reset_group()
        self.get_group()
        self.get_parameter()
        self.get_parameter_value()

    def reset_parameter(self):
        self.command.reset_parameter()
        self.get_parameter()
        self.get_parameter_value()

    def reset_value(self):
        self.command.reset_value()
        self.get_parameter_value()
    
    def reset_camera(self):
        try:
            camera_number = int(input("Which camera do you want to control? CameraIndex?"))
            self.command.set_camera(camera_number)

        except ValueError:
            print("Not a number")
            exit(1)
            
    def get_group(self) -> int:
        i=0
        print("Commands from following groups are available:")
        for group in self.protocol['groups']:
            print("{0}. {1}".format(i+1,group['name']))
            i=i+1

        try:
            print("---------------------------")
            group_input = int(input("From which group do you want to send a command?"))
            self.command.set_group(group_input - 1, self.protocol['groups'][group_input - 1]["name"])

        except ValueError:
            print("Not a number")
            exit(1)
            
    def get_parameter(self) -> int:
        j=0
        for parameter in self.protocol['groups'][self.command.groupId]['parameters']:
            print("{0}. {1}".format(j+1,parameter['parameter']))
            j=j+1

        try:
            print("---------------------------")
            parameter_input =  int(input("What do you want to control in the group {0}?".format(self.protocol['groups'][self.command.groupId]['name'])))
            parameter = self.protocol['groups'][self.command.groupId]['parameters'][parameter_input-1]
            self.command.set_parameter(parameter_input-1,parameter["parameter"],parameter["type"],parameter["index"] )

        except ValueError:
            print("Not a number")
            exit(1)

    def get_parameter_value(self):
        paramHandler = ParameterHandler(self.protocol['groups'][self.command.groupId]['parameters'][self.command.parameter.id])
        self.command = paramHandler.handleParam(self.command)
        
    def get_command(self):
        return self.command
