from models.connection import Connection

class Status:
    def __init__(self) -> None:
        self.connection = None
        
    def setConnection(self, connection: Connection):
        self.connection = connection