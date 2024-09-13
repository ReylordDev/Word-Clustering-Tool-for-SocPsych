from typing import Optional
from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class FileSettings(CamelModel):
    path: str
    delimiter: str
    has_header: bool
    selected_columns: list[int]


class AdvancedOptions(CamelModel):
    outlier_detection: bool
    nearest_neighbors: Optional[int]
    z_score_threshold: Optional[float]
    agglomerative_clustering: bool
    similarity_threshold: Optional[float]
    language_model: str


class AlgorithmSettings(CamelModel):
    auto_cluster_count: bool
    max_clusters: Optional[int]
    cluster_count: Optional[int]
    seed: Optional[int]
    excluded_words: list[str]
    advanced_options: AdvancedOptions


class Args(CamelModel):
    file_settings: FileSettings
    algorithm_settings: AlgorithmSettings
    # log_dir: str
    # log_level: str
    results_dir: str


class SimilarityPair(CamelModel):
    cluster_pair: list[int]
    similarity: float


class Response(CamelModel):
    response: str
    similarity: float


class Cluster(CamelModel):
    index: int
    responses: list[Response]


class Merger(CamelModel):
    merged_clusters: list[Cluster]
    similarity_pairs: list[SimilarityPair]


class Mergers(CamelModel):
    mergers: list[Merger]


class TimeStamp(CamelModel):
    name: str
    time: int


class TimeStamps(CamelModel):
    time_stamps: list[TimeStamp]


class ProgressMessage(CamelModel):
    step: str
    status: str
    timestamp: str
    type: str = "progress"


class RunNameMessage(CamelModel):
    name: str
    type: str = "run_name"
