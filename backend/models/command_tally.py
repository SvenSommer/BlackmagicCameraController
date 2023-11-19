from pydantic import BaseModel

from models.command_formatter import CommandFormatter

class CommandTally(BaseModel):
        camera: int
        active: bool
        preview: bool
        
class TallyFormatter(CommandFormatter):
    def __init__(self, command) -> None:
         self.command = command
     
    def create_command_string(self) -> str:
        active = self.command.active*1
        preview = self.command.preview*1
        return f"1,{self.command.camera},{active},{preview}"

    def format(self) -> str:
        return super().format()