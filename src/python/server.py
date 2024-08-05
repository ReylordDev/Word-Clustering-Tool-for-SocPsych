from typing import Union
from loguru import logger
from fastapi import FastAPI
from .models import FilePathParam, FileSettings

app = FastAPI()

logger.add(
    "logs/python/server.log", rotation="10 MB", retention="10 days", level="DEBUG"
)

file_settings: FileSettings = FileSettings(
    path="example_path", delimiter=",", header=True
)


@app.get("/")
def read_root():
    logger.debug("Hello World")
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}


@app.put("/file")
def select_file(params: FilePathParam):
    logger.debug(f"Selected file: {params.path}")
    global file_settings
    file_settings.path = params.path
    return {"path": params.path}
