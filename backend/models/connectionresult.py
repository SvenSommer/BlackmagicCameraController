from models.connection import Connection


class ConnectionResult:
    def __init__(self, ports: list[str] ) -> None:
        self.ports = ports
        self.connected = False
        self.connection = None
    
    def set_connection(self, connection: Connection) -> None:
        self.connection = connection
        self.message = "Connection established"
        self.connected = True

    def set_failure(self, message:str) -> None:
        self.message = message
        
    def getStatus(self) -> str:
        return self.message
    
    def getConnectionStatus(self) -> bool:
        return self.connected
    
    def getConnection(self) -> Connection:
        if self.connected:
            return self.connection
        
        return None