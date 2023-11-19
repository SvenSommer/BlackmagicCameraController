class CommandFormatter:
    @staticmethod
    def calculate_checksum(message):
        return sum(ord(c) for c in message) % 256

    def format(self):
        raise NotImplementedError("Subclasses should implement this!")
    
    def format_message(self, message: str) -> str:
        # Calculate the checksum
        checksum = self.calculate_checksum(message)
        # Append the checksum before the last two closing brackets
        return f"{message}*{checksum}}}"
