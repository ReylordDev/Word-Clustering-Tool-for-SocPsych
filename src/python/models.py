from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class FilePathParam(CamelModel):
    path: str


class FileSettingsParam(CamelModel):
    delimiter: str
    has_header: bool
    selected_columns: list[bool]


class FileSettings(CamelModel):
    path: str
    delimiter: str
    has_header: bool
    selected_columns: list[bool]


class AlgorithmSettings(CamelModel):
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
