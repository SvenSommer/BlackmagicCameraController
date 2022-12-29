from models.parameter import Parameter
from pydantic import BaseModel

class CommandValue(BaseModel):
        camera: int
        groupId: int
        parameterId: int
        parameterType: str
        parameterValue: float
        
        
class ValueFormatter():
    def __init__(self, command) -> None:
        self.command = command
                
    def format(self) -> str:

        notation= "{{{0},{1},{2},{3},{4},{5},{6}}}"

        return notation.format("2",self.command.camera, self.command.groupId, self.command.parameterId, self.command.parameterType,"0", self.command.parameterValue)
       