import asyncio
import logging
import socket
import yaml
import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from model.command_tally import CommandTally
from queue import Queue

# Configuration and Logging Setup
def load_config():
    with open("config.yaml", "r") as f:
        return yaml.safe_load(f)

config = load_config()
vmix_config = config["vmix"]
backend_config = config["backend"]
url = backend_config["url"] + "/command/tally"

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
logger = logging.getLogger(__name__)

# FastAPI Setup
app = FastAPI(title="CameraController TallyListener", description="Rest API to monitor tally information from vMix and send it to the backend.")
origins = ["*"]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"],)

# Main Application Logic
class TallyListener:
    def __init__(self):
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.connected = False
        self.subscribed = False
        self.command_queue = Queue()

    async def connect(self):
        logger.info(f"Trying to connect to {vmix_config['host']}:{vmix_config['port']}")
        try:
            self.sock.connect((vmix_config['host'], vmix_config['port']))
            data = self.sock.recv(1011)
            logger.info(f"Received {data!r}")
            self.connected = True
            self.subscribed = False
        except Exception as e:
            logger.error(e)
            self.connected = False
            self.subscribed = False

    async def subscribe(self):
        if self.connected:
            try:
                self.sock.sendall("SUBSCRIBE TALLY\r\n".encode('utf-8'))
                data = self.sock.recv(1011)
                logger.info(f"Received {data!r}")
                self.subscribed = True
            except Exception as e:
                logger.error(e)
                self.close_connection()

    def close_connection(self):
        self.connected = False
        self.subscribed = False
        self.sock.close()
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        logger.info("Socket closed")

    async def process_tally_data(self):
        while True:
            if not self.connected:
                await self.connect()
                if self.connected and not self.subscribed:
                    await self.subscribe()
            else:
                try:
                    while not self.command_queue.empty():
                        self.work_command()
                    data = self.sock.recv(1024)
                    if not data:
                        logger.info("Lost connection to vMix")
                        self.close_connection()
                        continue
                    self.process_data(data)
                except Exception as e:
                    logger.error(e)
                    self.close_connection()

    def process_data(self, data):
        splitted = data.decode('unicode_escape').split(' ')
        if splitted[0] == 'TALLY' and splitted[1] == 'OK' and len(splitted) == 3:
            camera_string = splitted[2].replace('\r\n', '')
            number_of_cameras = len(camera_string)
            for i in range(number_of_cameras):
                camera_no = i+1
                # 0 = off, 1 = program, 2 = preview
                camera_state = camera_string[i]
                command = CommandTally(camera=camera_no, active=(
                    camera_state == '1'), preview=(camera_state == '2'))
                self.command_queue.put(command)
        else:
            logger.error("Error: received {0}".format(data))
        

    def work_command(self):
        command = self.command_queue.get()
        logger.info(f"Sending tally command: {command}")
        self.send_tally_command(command)

    def send_tally_command(self, command: CommandTally):
        data = {
            "camera": command.camera,
            "active": command.active,
            "preview": command.preview
        }
        try:
            response = requests.post(url, json=data)
            return response.text
        except requests.exceptions.RequestException as e:
            logger.error(e)

# FastAPI Endpoints
listener = TallyListener()

@app.get("/status")
def get_status():
    status_msg = "connecting..."
    if not listener.connected and not listener.subscribed:
        status_msg = "connecting..."
    elif listener.connected and not listener.subscribed:
        status_msg = "connected"
    elif listener.connected and listener.subscribed:
        status_msg = "connected, subscribed"
    return {"status": status_msg}

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(listener.process_tally_data())

@app.get("/")
async def hello():
    return get_status()
