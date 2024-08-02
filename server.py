from typing import Union
from loguru import logger

from fastapi import FastAPI

app = FastAPI()

logger.remove()
logger.add(
    "logs/python/server.log", rotation="10 MB", retention="10 days", level="DEBUG"
)


@app.get("/")
def read_root():
    logger.debug("Hello World")
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}


@app.post("/file")
def select_file(path: str):
    logger.info(f"Selected file: {path}")
    return {"path": path}
