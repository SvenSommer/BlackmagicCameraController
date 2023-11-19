from pydantic import BaseModel

from models.command_formatter import CommandFormatter

class CommandValue(BaseModel):
        camera: int
        groupId: int
        parameterId: int
        parameterType: str
        parameterValue: object
        
        
class ValueFormatter(CommandFormatter):
    def __init__(self, command: CommandValue) -> None:
        self.command = command
                
    def format(self) -> str:
        notation= "{{{0},{1},{2},{3},{4},{5},{6}}}"
        formatted_message =  notation.format("2",self.command.camera, self.command.groupId, self.command.parameterId, self.command.parameterType,"0", self.command.parameterValue)
        checksum = self.calculate_checksum(formatted_message)
        return f"{formatted_message}*{checksum}"