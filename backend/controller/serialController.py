import sys
import glob
from models.connectionresult import ConnectionResult
from models.connection import Connection
import serial
import logging


class SerialController:
    def __init__(self):
        self.connection = None
        self.logger = logging.getLogger(__name__)

    def get_serial_ports(self) -> list[str]:
        if sys.platform.startswith('win'):
            ports = ['COM%s' % (i + 1) for i in range(256)]
        elif sys.platform.startswith('linux') or sys.platform.startswith('cygwin'):
            # This excludes your current terminal "/dev/tty".
            ports = glob.glob('/dev/tty[A-Za-z]*')
        elif sys.platform.startswith('darwin'):
            ports = glob.glob('/dev/tty.*')
        else:
            raise EnvironmentError('Unsupported platform')

        result_ports = []
        for port in ports:
            try:
                s = serial.Serial(port)
                s.close()
                result_ports.append(port)
            except (OSError, serial.SerialException):
                pass
        return result_ports

    def try_connect(self, port_id: int = 0) -> ConnectionResult:
        self.logger.info("Scanning for devices connected to this PC....")
        ports = self.get_serial_ports()
        self.logger.info(f"Found {len(ports)} open ports")
        result = ConnectionResult(ports)

        if not ports:
            result.set_failure(
                "No connected devices found. Please connect the Arduino with the appended Blackmagic SDK board to this PC.")
        elif (port_id+1) > len(ports) or port_id < 0:
            result.set_failure(
                f"Device not available. Found {len(ports)} open ports.")
        else:
            self.logger.info(f"Connecting to port ID {port_id}")
            connection = self.connect(ports[port_id])
            result.set_connection(connection)

        return result

    def disconnect(self) -> dict[str, str]:
        self.logger.info("Disconnecting....")
        self.connection.active_connection.close()
        self.connection = None
        return {"connection": "disconnected"}

    def get_ports(self) -> ConnectionResult:
        ports = self.get_serial_ports()
        result = ConnectionResult(ports)

        if self.connection:
            result.set_connection(self.connection)

        return result

    def connect(self, port: str) -> Connection:
        connection = Connection(port)
        connection.set_active_connection(
            serial.Serial(port, 115200, timeout=1))
        connection.message = self.read()
        self.connection = connection

        return connection

    def send_command(self, command: str):
        out = str(command).encode()
        self.logger.info(f"Sending: {out}")
        if self.connection is not None:
            self.connection.active_connection.write(out)

    def read(self) -> str:
        if self.connection is not None:
            return self.read_all(self.connection.active_connection, 5)

    def read_all(self, connection, chunk_size=200) -> str:
        """Read all characters on the serial port and return them."""
        if not connection.timeout:
            raise TypeError('Port needs to have a timeout set!')

        read_buffer = b''

        while True:
            # Read in chunks. Each chunk will wait as long as specified by
            # timeout. Increase chunk_size to fail quicker
            byte_chunk = connection.read(size=chunk_size)
            read_buffer += byte_chunk
            if not len(byte_chunk) == chunk_size:
                break

        return read_buffer.decode()
