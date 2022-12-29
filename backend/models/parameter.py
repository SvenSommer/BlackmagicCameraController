class Parameter:
    def __init__(self, id=None, name=None, type=None, index=[]) -> None:
        self.id = id
        self.name = name
        self.type = type
        self.index = index
        self.value = None
        self.values = []
        
    def setValue(self, value):
        self.value = value
        
    def addValue(self, value):
        self.values.append(value)
    
    def __str__(self) -> str:
        return str(self.__dict__)