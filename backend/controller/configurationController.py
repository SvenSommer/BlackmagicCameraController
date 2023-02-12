
import yaml
import os.path
import json

class ConfigurationController:
    def __init__(self, configfile) -> None:
        self.configfile = configfile
        self.text = """{
                        "cameras": [
                            {
                            "id": 1,
                            "no": 1,
                            "name": "Torkamera"
                            },
                            {
                            "id": 2,
                            "no": 2,
                            "name": "Mittelline"
                            },
                            {
                            "id": 3,
                            "no": 3,
                            "name": "Eckkamera Nordkurve"
                            },
                            {
                            "id": 4,
                            "no": 4,
                            "name": "Eckkamera Ostkurve"
                            }
                        ]
                        }"""
        
    def write_initial_configfile(self):
        json_file = json.loads(self.text)
        return self.save_config(json_file)
                
    def save_config(self, config_content):
        with open(self.configfile, 'w') as yamlfile:
            data = yaml.dump(config_content, yamlfile)
            return data
            
    def read_configfile(self):
        if os.path.isfile(self.configfile): 
            with open(self.configfile, "r") as yamlfile:
                data = yaml.load(yamlfile, Loader=yaml.FullLoader)
                return data
        return "No configfile at '{0}' found".format(self.configfile)
