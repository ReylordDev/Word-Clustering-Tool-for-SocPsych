from pydantic import BaseModel


class FilePathParam(BaseModel):
    path: str


class FileSettingsParam(BaseModel):
    separator: str
    has_header: bool
    selected_columns: list[int]


class FileSettings(BaseModel):
    path: str
    separator: str
    has_header: bool
    selected_columns: list[int]


class AlgorithmSettings(BaseModel):
    seed: int
    excluded_words: list[str]
    auto_cluster_count: bool
    nearest_neighbors: int
    z_score_threshold: float
    similarity_threshold: float
    language_model: str


class AutoAlgorithmSettings(AlgorithmSettings):
    auto_cluster_count: bool = True
    max_clusters: int


class ManualAlgorithmSettings(AlgorithmSettings):
    auto_cluster_count: bool = False
    cluster_count: int
