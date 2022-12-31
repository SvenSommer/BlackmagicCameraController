from pydantic import BaseModel
from pydantic_collections import BaseCollectionModel

class Camera(BaseModel):
    id : int
    no : int
    name: str
    
class CameraCollection(BaseCollectionModel[Camera]):
    pass