import socket


class SocketConnection:
    def __init__(self, host, port, logger):
        self.host = host
        self.port = port
        self.logger = logger
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    def connect(self):
        self.logger.info(f"Trying to connect to {self.host}:{self.port}")
        try:
            self.sock.connect((self.host, self.port))
            data = self.sock.recv(1011)
            self.logger.info(f"Received {data!r}")
            return True
        except Exception as e:
            self.logger.error(e)
            return False

    def close(self):
        self.sock.close()
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.logger.info("Socket closed")
