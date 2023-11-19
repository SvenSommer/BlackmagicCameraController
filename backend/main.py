# export PATH="/home/robert/.local/bin"
# C:\Users\robho\AppData\Local\Packages\PythonSoftwareFoundation.Python.3.10_qbz5n2kfra8p0\LocalCache\local-packages\Python310\Scripts\uvicorn.exe main:app --reload
# python3.exe -m  uvicorn main:app --reload
from queue import Queue

from threading import Thread
import time
from typing import List, Dict, Any
import json

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from controller.configurationController import ConfigurationController
from controller.protokolController import ProtokollController
from controller.serialController import SerialController

from models.command_tally import CommandTally, TallyFormatter
from models.command_value import CommandValue, ValueFormatter
from models.command_values import CommandValues, ValuesFormatter

import logging

app = FastAPI(title="CameraController Backend",
              description="Rest Api to control Black Magic cameras connected to the sdi interface of a shield on a arduino board")

origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

serial = SerialController()
protocol = ProtokollController('res/PROTOCOL.json')
configuration = ConfigurationController('res/config.yaml')
connection = None
connectionresult = serial.try_connect(0)
connection = connectionresult.getConnection()

command_queue = Queue()
command_thread_running = False
logger.info("Backend Application started")

def command_thread_func():
    global command_thread_running
    while command_thread_running:
        if not command_queue.empty():
            command = command_queue.get()
            serial.send_command(command)
            logger.info(f"Sent command: {command}")
            time.sleep(0.1)
        else:
            time.sleep(0.1)


@app.on_event("startup")
async def startup_event():
    global command_thread_running
    command_thread_running = True
    command_thread = Thread(target=command_thread_func)
    command_thread.start()


@app.on_event("shutdown")
async def shutdown_event():
    global command_thread_running
    command_thread_running = False


@app.get("/groups")
async def get_protocol():
    groups = protocol.get_groups()
    return {"groups": groups}


@app.post("/groups")
async def save_groups(groups_data: dict):
    protocol.save_groups(groups_data)
    logger.info("Groups data saved successfully")
    return {"message": "Groups data saved successfully"}


@app.post("/config")
async def set_config(config_data: dict):
    data = configuration.save_config(config_data)
    logger.info("Config data saved successfully")
    return {"message": "Config data saved successfully"}


@app.get("/config")
async def get_config():
    config = configuration.read_configfile()
    return {"config": config}


@app.get("/ports")
async def get_ports():
    ports = serial.get_ports()
    return {"ports": ports}


@app.get("/connect/{port_id}")
async def connect(port_id: int):
    global connection
    if connection is not None:
        return {"connection": "established"}

    connectionresult = serial.try_connect(port_id)
    if not connectionresult.connected:
        raise HTTPException(
            status_code=400, detail=f"Could not connect to port {port_id}: {connectionresult}")

    connection = connectionresult.getConnection()
    logger.info(f"Successfully connected to port {port_id}")
    return {"connection": connectionresult}


@app.get("/disconnect")
async def disconnect():
    global connection
    if connection is None:
        return {"connection": "disconnected"}

    connection = None
    response = serial.disconnect()
    logger.info("Disconnected from serial port")
    return response


@app.post("/command/value")
async def send_command_value(command: CommandValue):
    formatter = ValueFormatter(command)
    command_queue.put(formatter.format())
    logger.info(f"Queued command: {formatter.format()}")
    return


@app.post("/command/values")
async def send_command_values(command: CommandValues):
    formatter = ValuesFormatter(command)
    command_queue.put(formatter.format())
    logger.info(f"Queued command: {formatter.format()}")
    return {"result": "success"}


@app.post("/command/tally")
async def send_command_tally(command: CommandTally):
    formatter = TallyFormatter(command)
    command_queue.put(formatter.format())
    logger.info(f"Queued command: {formatter.format()}")
    return {"result": "success"}


@app.get("/")
async def status():
    return {"status": status}

@app.get("/read")
async def read():
    raw_data = serial.read()
    try:
        # Attempt to parse the data as JSON for structured output
        parsed_data = json.loads(raw_data)
    except json.JSONDecodeError:
        # If data is not JSON, use raw data
        parsed_data = raw_data

    response = {"data": parsed_data}
    formatted_response = json.dumps(response, indent=4)  # Pretty print the response
    logger.info(f"Received data: {formatted_response}")
    return response