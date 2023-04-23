import asyncio
import logging
import queue
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import yaml

from controller.command_sender import CommandSender
from controller.socket_connection import SocketConnection
from controller.tally_listener import TallyListener
from controller.tally_subscriber import TallySubscriber
from model.command_tally import CommandTally


app = FastAPI(title="CameraController TallyListener",
              description="Rest Api to monitor tally information from vMix and send it to the backend.")
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@app.get("/status")
def get_status():
    global tally_listener
    if tally_listener is None:
        status_msg = "connecting..."
    elif tally_listener.connected and not tally_listener.subscribed:
        status_msg = "connected"
    elif tally_listener.connected and tally_listener.subscribed:
        status_msg = "connected, subscribed"
    else:
        status_msg = "connecting..."
    return {"status": status_msg}


@app.on_event("startup")
async def startup_event():
    asyncio.create_task(main())


async def main():
    # Read configuration from YAML file
    with open("config.yaml", "r") as f:
        config = yaml.safe_load(f)

    logger = logging.getLogger(__name__)
    logger.setLevel(logging.INFO)

    tally_listener = TallyListener(config, logger, app)
    tally_listener.start()

    command_queue = tally_listener.command_queue
    command_sender = tally_listener.command_sender

    while True:
        try:
            # Send queued tally commands
            while not command_queue.empty():
                command_sender.send_command(command_queue.get())
        except Exception as e:
            logger.error(e)
        await asyncio.sleep(0.1)
