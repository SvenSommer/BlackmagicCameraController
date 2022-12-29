import sys
import glob
import serial


def serial_ports():
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

    result = []
    for port in ports:
        try:
            s = serial2.Serial(port)
            s.close()
            result.append(port)
        except (OSError, serial2.SerialException):
            pass
    return result


if __name__ == '__main__':
    ports = serial_ports()
    print(ports)
    ser = serial2.Serial(ports[0], 9600)
    while True:
        cc=str(ser.readline())
        print(cc[2:][:-5])

