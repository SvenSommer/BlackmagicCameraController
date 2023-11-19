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

    def format(self) -> str:
        # Define the notation without the checksum placeholder
        notation = "{{{0},{1},{2},{3},{4},{5},{6}}}"
        values = str(self.command.parameterValues)[1:-1].replace(" ", "")
        # Create the message without the checksum
        formatted_message = notation.format(
            "2",
            self.command.camera,
            self.command.groupId,
            self.command.parameterId,
            self.command.parameterType,
            len(self.command.parameterValues),
            values
        )
        # Use the base class method to format the message with the checksum
        return self.format_message(formatted_message)


