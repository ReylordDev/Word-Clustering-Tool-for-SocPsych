from typing import Union
from loguru import logger
from fastapi import FastAPI
from .models import (
    FilePathParam,
    FileSettings,
    FileSettingsParam,
    AutoAlgorithmSettings,
    ManualAlgorithmSettings,
)
from .main import main_new

app = FastAPI()

logger.add(
    "logs/python/server.log", rotation="10 MB", retention="10 days", level="DEBUG"
)

FILE_SETTINGS: FileSettings = FileSettings(
    path="",
    separator=",",
    header=True,
    selectedColumns=[],
)
ALGORITHM_SETTINGS: Union[AutoAlgorithmSettings, ManualAlgorithmSettings]


@app.get("/")
def read_root():
    return {
        "message": "Hello World",
        "file_settings": FILE_SETTINGS.model_dump(),
        "algorithm_settings": ALGORITHM_SETTINGS.model_dump(),
    }


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}


@app.put("/file")
def select_file(params: FilePathParam):
    logger.debug(f"Selected file: {params.path}")
    global FILE_SETTINGS
    FILE_SETTINGS.path = params.path
    return {"path": params.path}


@app.put("/file/settings")
def set_file_settings(settings: FileSettingsParam):
    logger.debug(f"Settings: {settings}")
    global FILE_SETTINGS
    FILE_SETTINGS.separator = settings.separator
    FILE_SETTINGS.header = settings.header
    FILE_SETTINGS.selectedColumns = settings.selectedColumns
    return settings.model_dump()


@app.put("/algorithm/settings")
def set_algorithm_settings(
    settings: Union[AutoAlgorithmSettings, ManualAlgorithmSettings],
):
    logger.debug(f"Settings: {settings}")
    global ALGORITHM_SETTINGS
    if isinstance(settings, AutoAlgorithmSettings):
        ALGORITHM_SETTINGS = AutoAlgorithmSettings(
            seed=settings.seed,
            excluded_words=settings.excluded_words,
            auto_cluster_count=settings.auto_cluster_count,
            max_clusters=settings.max_clusters,
            language_model=settings.language_model,
            nearest_neighbors=settings.nearest_neighbors,
            z_score_threshold=settings.z_score_threshold,
            similarity_threshold=settings.similarity_threshold,
        )
    else:
        ALGORITHM_SETTINGS = ManualAlgorithmSettings(
            seed=settings.seed,
            excluded_words=settings.excluded_words,
            auto_cluster_count=settings.auto_cluster_count,
            cluster_count=settings.cluster_count,
            language_model=settings.language_model,
            nearest_neighbors=settings.nearest_neighbors,
            z_score_threshold=settings.z_score_threshold,
            similarity_threshold=settings.similarity_threshold,
        )

    return settings.model_dump()


@app.put("/start")
def start():
    logger.debug("Starting clustering")
    if isinstance(ALGORITHM_SETTINGS, AutoAlgorithmSettings):
        main_new(
            FILE_SETTINGS.path,
            FILE_SETTINGS.separator,
            FILE_SETTINGS.header,
            FILE_SETTINGS.selectedColumns,
            ALGORITHM_SETTINGS.excluded_words,
            ALGORITHM_SETTINGS.language_model,
            ALGORITHM_SETTINGS.nearest_neighbors,
            ALGORITHM_SETTINGS.z_score_threshold,
            ALGORITHM_SETTINGS.auto_cluster_count,
            ALGORITHM_SETTINGS.max_clusters,
            ALGORITHM_SETTINGS.seed,
            None,
            ALGORITHM_SETTINGS.similarity_threshold,
        )
    else:
        main_new(
            FILE_SETTINGS.path,
            FILE_SETTINGS.separator,
            FILE_SETTINGS.header,
            FILE_SETTINGS.selectedColumns,
            ALGORITHM_SETTINGS.excluded_words,
            ALGORITHM_SETTINGS.language_model,
            ALGORITHM_SETTINGS.nearest_neighbors,
            ALGORITHM_SETTINGS.z_score_threshold,
            ALGORITHM_SETTINGS.auto_cluster_count,
            None,
            ALGORITHM_SETTINGS.seed,
            ALGORITHM_SETTINGS.cluster_count,
            ALGORITHM_SETTINGS.similarity_threshold,
        )
    return {"message": "Clustering started"}