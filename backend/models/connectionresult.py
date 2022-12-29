class ConnectionResult:
    def __init__(self, message, connected) -> None:
        self.message = message
        self.connected = connected
        self.connection = None
        print("[INFO] ConnectionResult: {0} ".format(message))        
    def setConnection(self, connection):
        self.connection = connection
        
    def getStatus(self):
        return self.message
    
    def getConnectionStatus(self):
        return self.connected
    
    def getConnection(self):
        if self.connected:
            return self.connection