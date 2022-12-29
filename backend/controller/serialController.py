import sys
import glob
import time
from models.connectionresult import ConnectionResult
import serial
from models.connection import Connection
from models.command import Command

class SerialController:
    def __init__(self) -> None:
        self.connection = None
    
    def getSerialPorts(self):
        """ Lists serial port names

            :raises EnvironmentError:
                On unsupported or unknown platforms
            :returns:
                A list of the serial ports available on the system
        """
        result_ports = []
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
                result_ports.append(port)
            except (OSError, serial.SerialException):
                pass
        return result_ports
    
    def tryconnect(self, portid = 0):
        print("[INFO] SerialController: Scanning for Devices connected to this PC....")
        result = ConnectionResult(self.getSerialPorts())
        print ("[INFO] SerialController: Found {0} open ports".format(len(result.ports)))
        if len(result.ports) == 0:
            result.set_failure("No connected devices found. Please connect the arduino with appended the blackmagic sdk board to this pc.")       
        elif (portid+1) > len(result.ports) or portid < 0:
            result.set_failure("ERROR: Device not available. Found {0} open ports".format(len(result.ports)))
        else:
            print ("[INFO] SerialController: Connecting to portid {0}".format(portid))
            connection = self.connect(result.ports[portid])
            result.set_connection(connection)
            
        return result

        
            
    def get_ports(self):
        result = ConnectionResult(self.getSerialPorts())
        if self.connection is not None:
            result.set_connection(self.connection)
        return result
        
    def connect(self, port):
        conncection = Connection(port)
        conncection.setActiveConnection(serial.Serial(port, 9600, timeout=1))
        time.sleep(10) 
        conncection.message = self.read()
        self.connection = conncection
        
        return conncection
    
    def sendCommand(self, command:str):
        out = str(command).encode()
        print()
        if(self.connection is not None):
            self.connection.active_connection.write(out)
            return self.read()
        else:
            return self.get_ports()
        
    def read(self):
        if(self.connection is not None):
            return self.read_all(self.connection.active_connection,5)
        
    def read_all(self, port, chunk_size=200):
        """Read all characters on the serial port and return them."""
        if not port.timeout:
            raise TypeError('Port needs to have a timeout set!')

        read_buffer = b''

        while True:
            # Read in chunks. Each chunk will wait as long as specified by
            # timeout. Increase chunk_size to fail quicker
            byte_chunk = port.read(size=chunk_size)
            read_buffer += byte_chunk
            if not len(byte_chunk) == chunk_size:
                break

        return read_buffer