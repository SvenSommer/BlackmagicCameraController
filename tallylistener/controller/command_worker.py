from typing import List

from pydantic import BaseModel


class CommandTally(BaseModel):
    camera: int
    active: bool
    preview: bool


class CommandWorker:
    def __init__(self, command_queue, command_sender, logger):
        self.command_queue = command_queue
        self.command_sender = command_sender
        self.logger = logger

    def work_command(self):
        command = self.command_queue.get()
        self.logger.info(f"Sending tally command: {command}")
        self.command_sender.send_command(command)
