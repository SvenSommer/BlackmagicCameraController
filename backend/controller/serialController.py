import sys
import glob
from models.connectionresult import ConnectionResult
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
    
    def tryconnect(self, portid = 0):
        ports = []
        print("[INFO] SerialController: Scanning for Devices connected to this PC....")
        ports = self.getSerialPorts()
        print ("[INFO] SerialController: Found {0} ports".format(len(ports)))
        if len(ports) == 0:
            return ConnectionResult("No connected devices found. Please connect the arduino with appended the blackmagic sdk board to this pc.", False)
        if len(ports) > 1:
            ports = []
            ports = self.getSerialPorts()
            returmessage = self.listConnetedPorts(ports)
            return ConnectionResult(returmessage, False)
        
        if (portid) >= len(ports) or portid < 0:
            return ConnectionResult("ERROR: Device not available", False)
        elif len(ports) == 1 or portid == 0:
            print ("[INFO] SerialController: Connecting to portid {0}".format(portid))
            connection = self.connect(portid)
            result =  ConnectionResult("connection established" , True)
            result.setConnection(connection)
            return result
        return ConnectionResult("Error: Try again", False)

    def listConnetedPorts(self, ports):
        return_message = ""
        return_message += "Found {0} devices connected to this pc:\r\n".format(len(ports))
        i = 1
        for port in ports:
            return_message += ("{0}: {1}\r\n".format(i, port ))
            i=i+1
        return_message += "Please choose a device you want to connect to\r\n"
        return return_message
        
            
            
        
    def connect(self, portid):
        conncection = Connection(self.ports[portid])
        conncection.activeConnection = serial.Serial(self.ports[portid], 9600)
        self.connection = conncection
        return conncection
    
    def sendCommand(self, command:Command):
        out = str(command).encode()
        print("Sending command '{0}'".format(out))
        self.connection.activeConnection.write(out)
        