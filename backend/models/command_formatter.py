class CommandFormatter:
    @staticmethod
    def calculate_checksum(message):
        return sum(ord(c) for c in message) % 256

    def format(self):
        raise NotImplementedError("Subclasses should implement this!")
