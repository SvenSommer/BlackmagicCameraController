class Connection:
    def __init__(self, port) -> None:
        self.port = port
        self.active_connection = None
        self.message = None
        
    def setActiveConnection(self, activeConnection):
        self.active_connection = activeConnection
        
    def getStatus(self):
        return "Connection established"