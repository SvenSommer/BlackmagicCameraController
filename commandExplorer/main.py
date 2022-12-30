


from controller.connectionController import ConnectionController
from controller.displayController import DisplayController
from controller.requestController import RequestController
from controller.inputController import InputController
from models.command import Command

server_ip = "127.0.0.1"
display = DisplayController()
request_controller = RequestController(server_ip)
protocol_json = request_controller.get("protocol")
connection = ConnectionController(request_controller)
input_controller = InputController(protocol_json['protocol'])

if __name__ == '__main__':
    if connection.is_connected():
        display.set_connection(connection.get_connection())
    display.showHeader()
    input_controller.initial_input()
    menue_input = 1
    while menue_input != 0:
        display.showMenue(input_controller.get_command())
        menue_input = int(input("What do you want to do?"))
        if menue_input == 1:
            input_controller.reset_camera()
        elif menue_input == 2:
            input_controller.reset_group()
        elif menue_input == 3:
            input_controller.reset_parameter()
        elif menue_input == 4:
            input_controller.reset_value()
        elif menue_input == 5:
            status = request_controller.send_command(input_controller.get_command()).status_code
            if status == 200:
                input("Command was sent successfully")
            else:
                input("Unable to send command. StatusCode: {0}".format(status))
