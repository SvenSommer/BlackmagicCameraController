from pydantic import BaseModel

class CommandTally(BaseModel):
        camera: int
        active: bool
        preview: bool
        
class TallyFormatter():
    def __init__(self, command) -> None:
         self.command = command
        
    def format(self) -> str:
        notation= "{{{0},{1},{2},{3}}}"
        active = self.command.active*1
        preview = self.command.preview*1
        return notation.format("1", self.command.camera, active, preview)
     