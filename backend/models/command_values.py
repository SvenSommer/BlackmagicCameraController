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
    notation = "{{{0},{1},{2},{3},{4},{5},{6},{7}}}"
    values = str(self.command.parameterValues)[1:-1].replace(" ", "")
    formatted_message = notation.format(
        "2",
        self.command.camera,
        self.command.groupId,
        self.command.parameterId,
        self.command.parameterType,
        len(self.command.parameterValues),
        values,
        "",
    )
    checksum = self.calculate_checksum(formatted_message)
    return formatted_message[:-3] + str(checksum) + "}}"
