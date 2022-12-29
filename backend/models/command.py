from models.parameter import Parameter
from pydantic import BaseModel

class Command(BaseModel):
    def __init__(self, camera, groupId) -> None:
        self.camera: int
        self.groupId: int
      #  self.parameter = Parameter()
                
    def format(self) -> str:
        # first argument
        #1 = tallyCommand
        #2 = other command
        return "Success"
        notation= "{{{0},{1},{2},{3},{4},{5},{6}}}"
        if self.parameter.value != None:
            return notation.format("2",self.camera, self.groupId, self.parameter.id, self.parameter.type,"0", self.parameter.value)
        elif len(self.parameter.values) > 0:
            values = str(self.parameter.values)[1:-1]
            return notation.format("2",self.camera, self.groupId, self.parameter.id, self.parameter.type,len(self.parameter.values), values)