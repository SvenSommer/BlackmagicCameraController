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

    def create_value_string(self) -> str:
        return f"2,{self.command.camera},{self.command.groupId},{self.command.parameterId},{self.command.parameterType},0,{self.command.parameterValue}"

    def format(self) -> str:
        # Use the base class method to format the message with the checksum
        return super().format()