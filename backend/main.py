#export PATH="/home/robert/.local/bin"
from models.command_tally import CommandTally, TallyFormatter
from models.command_value import CommandValue, ValueFormatter
from models.command import Command
from controller.serialController import SerialController
from fastapi import FastAPI
from models.status import Status

app = FastAPI(title="CameraController Backend", description="Rest Api to control Black Magic cameras connected to the sdi interface of a shield on a arduino board")
status = Status()
serial = SerialController()
connection = None

@app.get("/ports")
async def get_ports():
    return {"ports":serial.get_ports()}

@app.get("/connect/{port_id}")
async def connect(port_id: int):
    global connection
    if connection is not None:
        return{"connection":"established"}
    
    connectionresult = serial.tryconnect(port_id)
    if not connectionresult.connected:
        return{"connectionerror":connectionresult}
    else:
        connection = connectionresult.getConnection()
        return{"connection":connectionresult}
        
@app.post("/command/value")    
async def send_command(command: CommandValue):
    formatter = ValueFormatter(command)
    
    return{serial.sendCommand(formatter.format())}

@app.post("/command/values")    
async def send_command(command: Command):
    formatter = ValueFormatter(command)
    return{serial.sendCommand(formatter.format())}

@app.post("/command/tally")    
async def send_command(command: CommandTally):
    formatter = TallyFormatter(command)
    return{serial.sendCommand(formatter.format())}

@app.get("/")
async def status():
    return {"status":status}

@app.get("/read")    
async def read():
    return{serial.read()}