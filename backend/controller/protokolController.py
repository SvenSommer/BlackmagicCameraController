import json

class ProtokollController:
    def __init__(self, protocoll_file:str) -> None:
        self.file = protocoll_file
        self.protocoll = self.load_protocoll(protocoll_file)
        
    def load_protocoll(self, filename: str) -> str:
        with open(filename, encoding="utf8") as json_file:
            return json.loads(json_file.read())    
        
    def get_groups(self) -> str:
        return self.protocoll['groups']
    
    def save_groups(self, groups_data: dict) -> None:
        self.protocoll = groups_data
        with open(self.file, 'w', encoding="utf8") as json_file:
            json.dump(groups_data, json_file, ensure_ascii=False, indent=4)