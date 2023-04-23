import asyncio
import logging
import queue
import time

import uvicorn

from controller.command_sender import CommandSender
from controller.command_worker import CommandWorker
from controller.socket_connection import SocketConnection
from controller.tally_processor import TallyProcessor
from controller.tally_subscriber import TallySubscriber


class TallyListener:
    def __init__(self, config,  logger, app):
        self.config = config
        self.logger = logger
        self.command_queue = queue.Queue()
        self.socket_connection = SocketConnection(
            config["vmix"]["host"], config["vmix"]["port"], logger)
        self.tally_subscriber = TallySubscriber(
            self.socket_connection.sock, logger)
        self.tally_processor = TallyProcessor(logger)
        self.command_sender = CommandSender(
            config["backend"]["url"] + "/command/tally", logger)
        self.command_worker = CommandWorker(
            self.command_queue, self.command_sender, logger)
        self.app = app

    async def process_tally_data(self):
        try:
            while True:
                if not self.socket_connection.connect():
                    self.logger.info(
                        "Failed to connect to vMix server. Retrying...")
                    await self.reconnect()
                    continue
                if not self.socket_connection.subscribed:
                    self.tally_subscriber.subscribe()
                    self.socket_connection.subscribed = True
                try:
                    # Send queued tally commands
                    while not self.command_queue.empty():
                        self.logger.info(
                            f"Queue size: {self.command_queue.qsize()}")
                        self.command_worker.work_command()
                    data = self.socket_connection.sock.recv(1024)
                    if not data:
                        self.logger.info("Lost connection to vMix")
                        self.socket_connection.close()
                        await self.reconnect()
                        continue
                    self.tally_processor.process(data, self.command_queue)
                except Exception as e:
                    self.logger.error(e)
                    self.socket_connection.close()
                    await self.reconnect()
        except Exception as e:
            self.logger.error(e)
            self.socket_connection.close()
            await self.reconnect()

    async def reconnect(self):
        self.logger.info("Reconnecting to vMix server...")
        self.socket_connection.close()
        time.sleep(5)  # Wait for 5 seconds before reconnecting
        while not self.socket_connection.connect():
            self.logger.info("Failed to connect to vMix server. Retrying...")
            await asyncio.sleep(1)

    def start(self):
        loop = asyncio.get_event_loop()
        loop.create_task(self.process_tally_data())
        uvicorn.run(self.app, host=self.config["backend"]
                    ["host"], port=self.config["backend"]["port"])
