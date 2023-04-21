class Connection:
    def __init__(self, port: list[str]) -> None:
        self.port = port
        self.active_connection = None
        self.message = None

    def set_active_connection(self, activeConnection):
        self.active_connection = activeConnection

    def get_status(self):
        return "Connection established"
