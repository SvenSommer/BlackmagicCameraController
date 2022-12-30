from models.parameter import Parameter 

class Command:
    def __init__(self) -> None:
        self.camera = None
        self.groupId = None
        self.groupName = None
        self.parameter = None

        
    def set_camera(self, camera:int):
        self.camera = camera
        
    def set_group(self, groupId:int, groupName: str):
        self.groupId = groupId
        self.groupName = groupName
        
    def set_parameter(self, id:int,name: str, type: str, index:object):
        self.parameter = Parameter(id, name, type, index)
    
    def set_value(self, value:object):
        self.parameter.setValue(value)
        
    def add_value(self,value:object):
        self.parameter.addValue(value)
        
    def reset_group(self):
        self.groupId = None
        self.groupName = None
        self.reset_parameter();
        
    def reset_parameter(self):
        self.parameter = Parameter()
        self.reset_value()
        
    def reset_value(self):
        self.parameter.value = None
        self.parameter.values = []
        
    def is_value_parameter(self):
        if self.parameter.value != None:
            return True
        return False
        
    def is_values_parameter(self):
        if len(self.parameter.values) > 0:
            return True
        return False
        
    def __str__(self) -> str:
        # first argument
        #1 = tallyCommand
        #2 = other command
        notation= "{{{0},{1},{2},{3},{4},{5},{6}}}"
        if self.is_value_parameter():
            return notation.format("2",self.camera, self.groupId, self.parameter.id, self.parameter.type,"0", self.parameter.value)
        elif self.is_values_parameter():
            values = str(self.parameter.values)[1:-1]
            return notation.format("2",self.camera, self.groupId, self.parameter.id, self.parameter.type,len(self.parameter.values), values)