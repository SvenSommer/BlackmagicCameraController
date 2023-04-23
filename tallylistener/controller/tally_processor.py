
from pydantic import BaseModel


class CommandTally(BaseModel):
    camera: int
    active: bool
    preview: bool


class TallyProcessor:
    def __init__(self, logger):
        self.logger = logger

    def process(self, data, command_queue):
        splitted = data.decode('unicode_escape').split(' ')
        if splitted[0] == 'TALLY' and splitted[1] == 'OK' and len(splitted) == 3:
            camera_string = splitted[2].replace('\r\n', '')
            number_of_cameras = len(camera_string)
            for i in range(number_of_cameras):
                camera_no = i+1
                # 0 = off, 1 = program, 2 = preview
                camera_state = camera_string[i]
                self.logger.info("Camera {0} is {1}".format(
                    camera_no, camera_state))
                # Add command to queue only if state has changed
                command = CommandTally(camera=camera_no, active=(
                    camera_state == '1'), preview=(camera_state == '2'))
                command_queue.put(command)
        else:
            self.logger.error("Error: received {0}".format(data))
