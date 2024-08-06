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

EXAMPLE_FILE_PATH = "example_data/Self-Generated_Motives_of_Social_Casino_Gamers.csv"

FILE_SETTINGS: FileSettings = FileSettings(
    path="",
    delimiter=",",
    has_header=True,
    selected_columns=[],
)
ALGORITHM_SETTINGS: Union[AutoAlgorithmSettings, ManualAlgorithmSettings]


@app.get("/")
def read_root():
    return {
        "message": "Hello World",
        "file_settings": FILE_SETTINGS.model_dump(),
        "algorithm_settings": ALGORITHM_SETTINGS.model_dump(),
    }


@app.put("/file")
def select_file(params: FilePathParam):
    logger.debug(f"Selected file: {params.path}")
    global FILE_SETTINGS
    FILE_SETTINGS.path = params.path
    return {"path": params.path}


@app.get("/file")
def get_file():
    return {"path": FILE_SETTINGS.path}


@app.put("/file/example")
def select_example_file():
    logger.debug(f"Selected example file: {EXAMPLE_FILE_PATH}")
    global FILE_SETTINGS
    FILE_SETTINGS.path = EXAMPLE_FILE_PATH
    return {"path": EXAMPLE_FILE_PATH}


@app.put("/file/settings")
def set_file_settings(settings: FileSettingsParam):
    logger.debug(f"Settings: {settings}")
    global FILE_SETTINGS
    FILE_SETTINGS.delimiter = settings.delimiter
    FILE_SETTINGS.has_header = settings.has_header
    FILE_SETTINGS.selected_columns = settings.selected_columns
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
            FILE_SETTINGS.delimiter,
            FILE_SETTINGS.has_header,
            FILE_SETTINGS.selected_columns,
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
            FILE_SETTINGS.delimiter,
            FILE_SETTINGS.has_header,
            FILE_SETTINGS.selected_columns,
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
