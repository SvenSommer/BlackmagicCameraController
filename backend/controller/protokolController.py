import json

class ProtokollController:
    def __init__(self, protocoll_file:str) -> None:
        self.file = protocoll_file
        self.protocoll = self.load_protocoll(protocoll_file)
        
    def load_protocoll(self, filename: str) -> str:
        with open(filename, encoding="utf8") as json_file:
            return json.loads(json_file.read())    
        
    def get_protocol(self) -> str:
        return self.protocoll
