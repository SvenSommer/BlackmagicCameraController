from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from collections import deque
from subprocess import Popen, PIPE, STDOUT
import subprocess
from os import system
import os
import logging

app = FastAPI(title="Utility Service",
              description="Service for logs, service status, code updates, and shutdown operations")

origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Configure logging
logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

@app.get("/logs/{log_name}")
async def get_log(log_name: str):
    log_path = f"/home/robert/dev/BlackmagicCameraController/logs/{log_name}.log"
    if not os.path.exists(log_path):
        raise HTTPException(status_code=404, detail="Log file not found")

    def log_file_generator():
        with open(log_path, "r") as log_file:
            # Use deque to keep the last 50 lines
            last_lines = deque(log_file, maxlen=50)

        # Reverse the order of lines
        for line in reversed(last_lines):
            yield line

    return StreamingResponse(log_file_generator(), media_type="text/plain")


@app.get("/service-status/{service_name}")
async def get_service_status(service_name: str):
    result = subprocess.run(["systemctl", "is-active", service_name], capture_output=True, text=True)
    return {"service": service_name, "status": result.stdout.strip()}


@app.post("/restart-service/{service_name}")
async def restart_service(service_name: str):
    try:
        subprocess.run(["systemctl", "restart", service_name], check=True)
        return {"status": "success", "message": f"Service {service_name} restarted successfully"}
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Failed to restart service: {e}")

@app.post("/update-code")
async def update_code():
    try:
        commands = ["git reset --hard", "git pull origin main"]
        for cmd in commands:
            process = Popen(cmd, shell=True, stdout=PIPE, stderr=STDOUT)
            output, error = process.communicate()
            if process.returncode != 0:
                error_details = {
                    "command": cmd,
                    "error_message": output.decode(),
                    "return_code": process.returncode
                }
                raise Exception(f"Command '{cmd}' failed: {error_details}")

        return {"status": "success", "message": "Code updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/shutdown_server")
async def shutdown_server_event():
    try:
        system("sudo /sbin/shutdown now")
        return {"status": "success", "message": "System is shutting down"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))