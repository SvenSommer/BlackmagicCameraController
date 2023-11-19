from pydantic import BaseModel

from models.command_formatter import CommandFormatter


class CommandValues(BaseModel):
    camera: int
    groupId: int
    parameterId: int
    parameterType: str
    parameterValues: list[object]


class ValuesFormatter(CommandFormatter):
    def __init__(self, command: CommandValues) -> None:
        self.command = command
    
    def create_value_string(self) -> str:
        # Convert the parameter values list to a comma-separated string
        values = str(self.command.parameterValues)[1:-1].replace(" ", "")
        # Create the comma-separated value string
        return f"2,{self.command.camera},{self.command.groupId},{self.command.parameterId},{self.command.parameterType},{len(self.command.parameterValues)},{values}"

    def format(self) -> str:
        # Use the base class method to format the message with the checksum
        return super().format()