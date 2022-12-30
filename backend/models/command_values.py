from pydantic import BaseModel

class CommandValues(BaseModel):
        camera: int
        groupId: int
        parameterId: int
        parameterType: str
        parameterValues: list[object]
        
        
class ValuesFormatter():
    def __init__(self, command: CommandValues) -> None:
        self.command = command
                
    def format(self) -> str:

        notation= "{{{0},{1},{2},{3},{4},{5},{6}}}"
        print(self.command.parameterValues)
        values = str(self.command.parameterValues)[1:-1].replace(' ','')
        return notation.format("2", self.command.camera,  self.command.groupId,  self.command.parameterId,  self.command.parameterType,len( self.command.parameterValues), values)