class ConnectionResult:
    def __init__(self, ports) -> None:
        self.ports = ports
        self.connected = False
        self.connection = None
    
    def set_connection(self, connection) -> None:
        self.connection = connection
        self.message = "Connection established"
        self.connected = True

    def set_failure(self, message) -> str:
        self.message = message
        
    def getStatus(self) -> str:
        return self.message
    
    def getConnectionStatus(self) -> bool:
        return self.connected
    
    def getConnection(self):
        if self.connected:
            return self.connection
        
        return None