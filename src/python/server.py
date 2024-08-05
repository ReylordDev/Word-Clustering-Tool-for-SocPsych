from typing import Union
from loguru import logger
from fastapi import FastAPI
from .models import FilePathParam, FileSettings, FileSettingsParam

app = FastAPI()

logger.add(
    "logs/python/server.log", rotation="10 MB", retention="10 days", level="DEBUG"
)

file_settings: FileSettings = FileSettings(
    path="example_path", separator=",", header=True, selectedColumns=[0]
)


@app.get("/")
def read_root():
    logger.debug("Hello World")
    return file_settings.model_dump()


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}


@app.put("/file")
def select_file(params: FilePathParam):
    logger.debug(f"Selected file: {params.path}")
    global file_settings
    file_settings.path = params.path
    return {"path": params.path}


@app.put("/file/settings")
def set_file_settings(settings: FileSettingsParam):
    logger.debug(f"Settings: {settings}")
    global file_settings
    file_settings.separator = settings.separator
    file_settings.header = settings.header
    file_settings.selectedColumns = settings.selectedColumns
    return settings.model_dump()
