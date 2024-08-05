from pydantic import BaseModel


class FilePathParam(BaseModel):
    path: str


class FileSettingsParam(BaseModel):
    separator: str
    header: bool
    selectedColumns: list[int]


class FileSettings(BaseModel):
    path: str
    separator: str
    header: bool
    selectedColumns: list[int]
