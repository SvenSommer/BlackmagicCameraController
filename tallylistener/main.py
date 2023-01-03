import socket
import requests

from model.CommandTally import CommandTally
url = 'http://127.0.0.1:8000/command/tally' # The server's hostname or IP address Backend is running on

# Create a TCP/IP socket
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
HOST = "192.168.178.148"  # The server's hostname or IP address VMIX is running on
PORT = 8099 

def connect():
    sock.connect((HOST, PORT))
    data = sock.recv(1011)
    print(f"Received {data!r}")

def subscribe():
    m = "SUBSCRIBE TALLY\r\n"
    unicode_string = m.encode('utf-8')
    sock.sendall(unicode_string)
    data = sock.recv(1011)
    print(f"Received {data!r}")
    
def sendTallyCommand(command: CommandTally):
    data = {
                "camera": command.camera,
                "active": command.active,
                "preview": command.preview
            }
    try:
        response = requests.post(url, json=data)
        return response.text
    except requests.exceptions.RequestException as e:
        print(e)
   
    

def process(data):
    splitted = data.decode('unicode_escape').split(' ')
    if splitted[0] == 'TALLY' and splitted[1] == 'OK' and len(splitted) == 3:
        camera_string = splitted[2].replace('\r\n','')
        number_of_cameras = len(camera_string)
        for i in range(number_of_cameras):
            camera_no = i+1
            # 0 = off, 1 = program, 2 = preview
            camera_state = camera_string[i]
            print("Camera {0} is {1}".format(camera_no,camera_state))
            #TODO: Implement State Machine to only notify cameras which changes to reduce traffic
            if camera_state == "0":
                command = CommandTally(camera=camera_no, active=False, preview=False)
                print(sendTallyCommand(command))
            if camera_state == "1":
                command = CommandTally(camera=camera_no, active=True, preview=False)
                print(sendTallyCommand(command))
            if camera_state == "2":
                command = CommandTally(camera=camera_no, active=False, preview=True)
                print(sendTallyCommand(command))
        
    else:
        print("Error: received {0}".format(data))



if __name__ == '__main__':
    connect()
    subscribe()
    try:
        while True:
            data = sock.recv(1024)
            if not data:
                break
            process(data)
    except KeyboardInterrupt:
        pass
        
    
    


