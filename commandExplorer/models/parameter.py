class Parameter:
    def __init__(self, id:int = None, name:str  = None, type:str  = None, index=object) -> None:
        self.id = id
        self.name = name
        self.type = type
        self.index = index
        self.value = None
        self.values = []
        
    def setValue(self, value:object):
        self.value = value
        
    def addValue(self, value:object):
        self.values.append(value)
    
    def __str__(self) -> str:
        return str(self.__dict__)