class Parameter:
    def __init__(self, id:int, name:str, type:str, index=object) -> None:
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