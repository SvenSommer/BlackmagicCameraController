
import requests

from models.command import Command

class RequestController():
    def __init__(self, server_ip) -> None:
        self.server_ip = server_ip
        
    def get(self, param: str) -> str:
        url = "http://{0}:8000/{1}".format(self.server_ip, param)
        r = requests.get(url)
        return r.json()
    
    def send_command(self, command: Command):
        if command.is_value_parameter(): 
            url = "http://{0}:8000/{1}".format(self.server_ip, "command/value")
            data = {
                    "camera": command.camera,
                    "groupId": command.groupId,
                    "parameterId": command.parameter.id,
                    "parameterType": command.parameter.type,
                    "parameterValue": command.parameter.value
                }
            response = requests.post(url, json=data)
            return response
        if command.is_values_parameter():
            url = "http://{0}:8000/{1}".format(self.server_ip, "command/values")
            data = {
                    "camera": command.camera,
                    "groupId": command.groupId,
                    "parameterId": command.parameter.id,
                    "parameterType": command.parameter.type,
                    "parameterValues": command.parameter.values
                }
            response = requests.post(url, json=data)
            return response
        