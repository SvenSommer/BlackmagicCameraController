import sys
import glob
import serial
from models.connection import Connection
from models.command import Command

class SerialController:
    def __init__(self) -> None:
        self.ports = []
        self.connection = None
    
    def getSerialPorts(self):
        """ Lists serial port names

            :raises EnvironmentError:
                On unsupported or unknown platforms
            :returns:
                A list of the serial ports available on the system
        """
        if sys.platform.startswith('win'):
            ports = ['COM%s' % (i + 1) for i in range(256)]
        elif sys.platform.startswith('linux') or sys.platform.startswith('cygwin'):
            # this excludes your current terminal "/dev/tty"
            ports = glob.glob('/dev/tty[A-Za-z]*')
        elif sys.platform.startswith('darwin'):
            ports = glob.glob('/dev/tty.*')
        else:
            raise EnvironmentError('Unsupported platform')


        for port in ports:
            try:
                s = serial.Serial(port)
                s.close()
                self.ports.append(port)
            except (OSError, serial.SerialException):
                pass
        return self.ports
    
    def connect(self, portid):
        conncection = Connection(self.ports[portid])
        conncection.activeConnection = serial.Serial(self.ports[portid], 9600)
        self.connection = conncection
        return conncection
    
    def sendCommand(self, command:Command):
        out = str(command).encode()
        print("Sending command '{0}'".format(out))
        self.connection.activeConnection.write(out)
        