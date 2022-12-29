from models.command import Command
from models.connectionresult import ConnectionResult
from models.connection import Connection
from controller.serialController import SerialController
from fastapi import FastAPI
from models.status import Status

app = FastAPI(title="CameraController Backend", description="Rest Api to control Black Magic cameras connected to the sdi interface of a shield on a arduino board")
status = Status()
serial = SerialController()
connection = None
@app.get("/connect/{port_id}")
async def connect(port_id: int):
    global connection
    if connection is not None:
        return{"connection":"established"}
    
    connectionresult = serial.tryconnect(port_id)
    if not connectionresult.connected:
        return{"connectionerror":connectionresult.getStatus()}
    else:
        connection = connectionresult.getConnection()
        return{"connection":connectionresult.getStatus()}
        
@app.post("/command/")   
def send_command(command: Command):
    return{"command sent":command.format()}

@app.get("/")
async def status():
    return {"status":status}