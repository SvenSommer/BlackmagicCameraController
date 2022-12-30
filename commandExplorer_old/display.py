from models.command import Command
from models.connection import Connection
import os

clear = lambda: os.system('cls')
class Display:
    def __init__(self) -> None:
        self.connection = None
        
    def set_connection(self, connection):
        self.connection = connection
    
    def showHeader(self, command=None):
        clear()
        print("Black Magic Cameras - Command Explorer")
        print("===========================")
        if self.connection is not None:
            print("Connected to device at {0}".format(self.connection.port))
        if command is not None:
            print("COMMAND OVERVIEW")
            if command.camera != None:
                print("CameraIndex\t: {0}".format(command.camera)) 
            if command.groupId != None:
                print("group\t\t: {0} (id:{1})".format(command.groupName,command.groupId)) 
            if command.parameter.id:
                print("Parameter\t: {0} (id:{1})".format(command.parameter.name, command.parameter.id)) 
            if command.parameter.type:
                print("\tType\t: {0}".format(command.parameter.type)) 
            if command.parameter.value != None:
                print("\tValue\t: {0}".format(command.parameter.value)) 
            if len(command.parameter.values) > 0:
                print("\tValues\t")
                i = 0
                for subvalue in command.parameter.values:
                    print("\t{0}\t: {1}".format(command.parameter.index[i], subvalue))
                    i=i+1
            print("---------------------------")

    def showMenue(self, command:Command):
        self.showHeader(command)
        print("COMMAND MENUE")
        print("1: Change Camera")
        print("2: Change Group")
        print("3: Change Parameter")
        print("4: Change Value")
        print("5: Send Command")
        print("0: Exit")
        print("---------------------------")