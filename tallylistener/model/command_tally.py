from pydantic import BaseModel


class CommandTally(BaseModel):
    camera: int
    active: bool
    preview: bool
