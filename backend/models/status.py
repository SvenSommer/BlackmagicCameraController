class Status:
    def __init__(self) -> None:
        self.connection = None
        
    def setConnection(self, connection):
        self.connection = connection