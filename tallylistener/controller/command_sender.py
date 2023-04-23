import logging
import requests

from pydantic import BaseModel


class CommandTally(BaseModel):
    camera: int
    active: bool
    preview: bool


class CommandSender:
    def __init__(self, url, logger):
        self.url = url
        self.logger = logger

    def send_command(self, command: CommandTally):
        data = {
            "camera": command.camera,
            "active": command.active,
            "preview": command.preview
        }
        try:
            response = requests.post(self.url, json=data)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            self.logger.error(e)
