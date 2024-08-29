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


class Args(CamelModel):
    path: str
    delimiter: str
    has_headers: bool
    selected_columns: list[int]
    excluded_words: list[str]
    language_model: str
    nearest_neighbors: int
    z_score_threshold: float
    automatic_k: bool
    max_num_clusters: int
    seed: int
    cluster_count: int
    merge_threshold: float
    log_dir: str
    log_level: str
    output_dir: str


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
