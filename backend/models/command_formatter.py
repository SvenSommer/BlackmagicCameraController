class CommandFormatter:
    @staticmethod
    def calculate_checksum(message):
        return sum(ord(c) for c in message) % 256

    def format(self) -> str:
        # Create the value string without brackets
        values = self.create_command_string()
        checksum = self.calculate_checksum(values)
        # Append the checksum and enclose in brackets
        return f"{{{values}*{checksum}}}"
    
    def create_command_string(self) -> str:
        # Implement this method in subclasses to return the comma-separated values
        pass
