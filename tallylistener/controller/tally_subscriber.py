class TallySubscriber:
    def __init__(self, sock, logger):
        self.sock = sock
        self.logger = logger

    def subscribe(self):
        m = "SUBSCRIBE TALLY\r\n"
        unicode_string = m.encode('utf-8')
        self.sock.sendall(unicode_string)
        data = self.sock.recv(1011)
        self.logger.info(f"Received {data!r}")
