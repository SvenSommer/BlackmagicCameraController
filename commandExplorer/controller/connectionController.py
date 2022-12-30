class ConnectionController():
    def __init__(self, request_controller) -> None:
        self.request_controller = request_controller
        self.get_connection_from_endpoint()
        self.connection = None

    def get_connection_from_endpoint(self):
        self.connected = False
        ports_data = self.request_controller.get("ports")
        if ports_data["ports"]["connected"]:
            self.connected = True
            self.connection = ports_data["ports"]["connection"]
    
    def is_connected(self):
        self.get_connection_from_endpoint()
        return self.connected

    def get_connection(self):
        return self.connection