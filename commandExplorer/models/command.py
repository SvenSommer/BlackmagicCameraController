from models.parameter import Parameter 

class Command:
    def __init__(self) -> None:
        self.camera = None
        self.groupId = None
        self.groupName = None
        self.parameter = Parameter()

        
    def setCamera(self, camera:int):
        self.camera = camera
        
    def setGroup(self, groupId:int, groupName: str):
        self.groupId = groupId
        self.groupName = groupName
        
    def setParameter(self, id:int,name: str, type: str, index: any):
        self.parameter = Parameter(id, name, type, index)
    
    def setValue(self, value):
        self.parameter.setValue(value)
        
    def addValue(self,value):
        self.parameter.addValue(value)
        
    def resetGroup(self):
        self.groupId = None
        self.groupName = None
        self.resetParameter();
        
    def resetParameter(self):
        self.parameter = Parameter()
        self.resetValue()
        
    def resetValue(self):
        self.parameter.value = None
        self.parameter.values = []
        
    def __str__(self) -> str:
        # first argument
        #1 = tallyCommand
        #2 = other command
        notation= "{{{0},{1},{2},{3},{4},{5},{6}}}"
        if self.parameter.value != None:
            return notation.format("2",self.camera, self.groupId, self.parameter.id, self.parameter.type,"0", self.parameter.value)
        elif len(self.parameter.values) > 0:
            values = str(self.parameter.values)[1:-1]
            return notation.format("2",self.camera, self.groupId, self.parameter.id, self.parameter.type,len(self.parameter.values), values)