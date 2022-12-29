class Connection:
    def __init__(self, port) -> None:
        self.port = port
        self.activeConnection = None
        
    def setActiveConnection(self, activeConnection):
        self.activeConnection = activeConnection
        
    def getStatus(self):
        return "Connection established"