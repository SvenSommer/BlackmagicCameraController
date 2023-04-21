# export PATH="/home/robert/.local/bin"
# C:\Users\robho\AppData\Local\Packages\PythonSoftwareFoundation.Python.3.10_qbz5n2kfra8p0\LocalCache\local-packages\Python310\Scripts\uvicorn.exe main:app --reload
# python3.exe -m  uvicorn main:app --reload
import asyncio
import socket
import requests
import queue
import logging
import time
from model.CommandTally import CommandTally
import yaml
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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

# Read configuration from YAML file
with open("config.yaml", "r") as f:
    config = yaml.safe_load(f)

vmix_config = config["vmix"]
backend_config = config["backend"]

url = backend_config["url"] + "/command/tally"

# Create a TCP/IP socket
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

HOST = vmix_config["host"]
PORT = vmix_config["port"]

connected = False
subscribed = False


def connect():
    global sock
    global connected
    global subscribed
    logger.info(f"Trying to connect to {HOST}:{PORT}")
    try:
        sock.connect((HOST, PORT))
        data = sock.recv(1011)
        logger.info(f"Received {data!r}")
        connected = True
        subscribed = False
    except Exception as e:
        logger.error(e)
        connected = False
        subscribed = False
        return


def subscribe():
    global subscribed
    m = "SUBSCRIBE TALLY\r\n"
    unicode_string = m.encode('utf-8')
    sock.sendall(unicode_string)
    data = sock.recv(1011)
    logger.info(f"Received {data!r}")
    subscribed = True


def send_tally_command(command: CommandTally):
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


def close_connection():
    global sock
    global connected
    global subscribed
    connected = False
    subscribed = False
    sock.close()
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    logger.info("Socket closed")


def process(data, queue):
    splitted = data.decode('unicode_escape').split(' ')
    if splitted[0] == 'TALLY' and splitted[1] == 'OK' and len(splitted) == 3:
        camera_string = splitted[2].replace('\r\n', '')
        number_of_cameras = len(camera_string)
        for i in range(number_of_cameras):
            camera_no = i+1
            # 0 = off, 1 = program, 2 = preview
            camera_state = camera_string[i]
            logger.info("Camera {0} is {1}".format(camera_no, camera_state))
            # Add command to queue only if state has changed
            if queue.empty() or queue.queue[-1].camera != camera_no or queue.queue[-1].active != (camera_state == '1') or queue.queue[-1].preview != (camera_state == '2'):
                command = CommandTally(camera=camera_no, active=(
                    camera_state == '1'), preview=(camera_state == '2'))
                queue.put(command)
    else:
        logger.error("Error: received {0}".format(data))


@app.get("/status")
def get_status():
    global connected
    global subscribed
    status_msg = "connecting"
    if not connected:
        status_msg = "connecting"
    elif connected and not subscribed:
        status_msg = "connected"
    elif connected and subscribed:
        status_msg += ", Subscribed"
    return {"status": status_msg}


@app.get("/hello")
async def hello():
    return {"message": "Hello World"}


@app.on_event("startup")
async def startup_event():
    command_queue = queue.Queue()
    loop = asyncio.get_event_loop()
    loop.create_task(process_tally_data(command_queue))


async def process_tally_data(command_queue):
    try:
        while True:
            if not connected:
                connect()
                if connected and not subscribed:
                    subscribe()
            else:
                try:
                    # Send queued tally commands
                    if not command_queue.empty():
                        logger.info(f"Queue size: {len(command_queue.queue)}")
                        command = command_queue.get()
                        logger.info(f"Sending tally command: {command}")
                        send_tally_command(command)
                        command_queue.task_done()
                    data = sock.recv(4024)
                    if not data:
                        logger.info("Lost connection to vMix")
                        close_connection()
                        continue
                    process(data, command_queue)
                except Exception as e:
                    logger.error(e)
                    close_connection()

            logger.info(f"Current status: {get_status()}")
            await asyncio.sleep(1)
    except KeyboardInterrupt:
        pass
