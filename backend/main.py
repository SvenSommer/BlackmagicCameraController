#export PATH="/home/robert/.local/bin"
#C:\Users\robho\AppData\Local\Packages\PythonSoftwareFoundation.Python.3.10_qbz5n2kfra8p0\LocalCache\local-packages\Python310\Scripts\uvicorn.exe main:app --reload
# python3.exe -m  uvicorn main:app --reload
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from controller.configurationController import ConfigurationController
from controller.protokolController import ProtokollController
from controller.serialController import SerialController
from models.camera import CameraCollection
from models.command_tally import CommandTally, TallyFormatter
from models.command_value import CommandValue, ValueFormatter
from models.command_values import CommandValues, ValuesFormatter

app = FastAPI(title="CameraController Backend", description="Rest Api to control Black Magic cameras connected to the sdi interface of a shield on a arduino board")
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

serial = SerialController()
protocol = ProtokollController('res/PROTOCOL.json')
configuration = ConfigurationController('res/config.yaml')
connection = None
connectionresult = serial.try_connect(0)
connection = connectionresult.getConnection()

@app.get("/groups")    
async def get_protocol():
    return{"groups": protocol.get_groups()}

@app.post("/groups")    
async def save_groups(groups_data: dict):
    protocol.save_groups(groups_data)
    return {"message": "Groups data saved successfully"}

@app.post("/config")    
async def set_config(config_data: dict):
    data = configuration.save_config(config_data)
    return {"message": "Config data saved successfully"}

@app.get("/config")    
async def get_config():
    return{"config": configuration.read_configfile()}

@app.get("/ports")
async def get_ports():
    return {"ports":serial.get_ports()}

@app.get("/connect/{port_id}")
async def connect(port_id: int):
    global connection
    if connection is not None:
        return{"connection":"established"}
    
    connectionresult = serial.try_connect(port_id)
    if not connectionresult.connected:
        return{"connectionerror":connectionresult}
    else:
        connection = connectionresult.getConnection()
        return{"connection":connectionresult}
    
@app.get("/disconnect")
async def disconnect():
    global connection
    if connection is None:
        return{"connection":"disconnected"}
    
    connection = None
    return serial.disconnect()
        
@app.post("/command/value")    
async def send_command(command: CommandValue):
    formatter = ValueFormatter(command)
    serial.sendCommand(formatter.format())
    return{"result":"success"}

@app.post("/command/values")    
async def send_command(command: CommandValues):
    formatter = ValuesFormatter(command)
    serial.sendCommand(formatter.format())
    return{"result":"success"}

@app.post("/command/tally")    
async def send_command(command: CommandTally):
    formatter = TallyFormatter(command)
    serial.sendCommand(formatter.format())
    return{"result":"success"}

@app.get("/")
async def status():
    return {"status":status}

@app.get("/read")    
async def read():
    return{serial.read()}