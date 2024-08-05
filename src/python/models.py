from pydantic import BaseModel


class FilePathParam(BaseModel):
    path: str


class FileSettings(BaseModel):
    path: str
    delimiter: str
    header: bool
