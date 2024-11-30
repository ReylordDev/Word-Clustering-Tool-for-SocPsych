from collections import Counter
from datetime import datetime
import json
import os
import csv
import sys
from typing import Optional
from matplotlib import pyplot as plt
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.cluster import AgglomerativeClustering, KMeans
from sklearn.metrics import silhouette_score
from loguru import logger
import argparse
import time

from models import (
    Args,
    Cluster,
    Response,
    Merger,
    Mergers,
    TimeStamp,
    TimeStamps,
    FileSettings,
    AlgorithmSettings,
    AdvancedOptions,
    ProgressMessage,
    RunNameMessage,
)

progression_messages = {
    "process_input_file": "Reading input file",
    "download_model": "Downloading language model",
    "load_model": "Loading language model",
    "embed_responses": "Embedding responses",
    "detect_outliers": "Detecting outliers",
    "find_number_of_clusters": "Finding number of clusters",
    "cluster": "Clustering",
    "merge": "Merging clusters",
    "results": "Saving clustering results",
}

time_stamps: list[TimeStamp] = []


def process_input_file(
    file_settings: FileSettings,
    excluded_words: list[str],
):
    logger.info(f"STARTED: {progression_messages['process_input_file']}")
    print_progress_message("process_input_file", "STARTED")
    rows: list[list[str]] = []
    response_counts: Counter[str] = Counter()
    with open(file_settings.path, encoding="utf-8") as f:
        reader = csv.reader(f, delimiter=file_settings.delimiter)
        if file_settings.has_header:
            headers = reader.__next__()
            logger.debug(f"Headers: {headers}")
        else:
            headers = []
        col_idxs: list[int] = []

        for i in file_settings.selected_columns:
            col_idxs.append(i)
        logger.debug(f"Column indexes: {col_idxs}")

        for row in reader:
            rows.append(row)

            for column_index in col_idxs:
                # get the next entry provided by the current participant
                response = row[column_index]
                if response == "" or response is None:
                    continue
                for excluded_word in excluded_words:
                    if (
                        excluded_word != ""
                        and excluded_word.lower() in response.lower()
                    ):
                        logger.info(
                            f"Excluded word found: {excluded_word} in response: {response}"
                        )
                        break
                # otherwise, count the response
                response_counts[response] += 1
    unique_response_count = len(response_counts)
    responses = list(response_counts.keys())
    logger.info(f"COMPLETED: {progression_messages['process_input_file']}")
    print_progress_message("process_input_file", "DONE")
    time_stamps.append(
        TimeStamp(
            name=progression_messages["process_input_file"], time=int(time.time())
        )
    )
    logger.debug(f"Number of rows: {len(rows)}")
    logger.debug(f"Number of unique responses: {unique_response_count}")

    return responses, response_counts, [headers] + rows


def load_model(language_model: str) -> SentenceTransformer:
    logger.info(f"STARTED: {progression_messages['load_model']}")
    print_progress_message("load_model", "STARTED")
    model = SentenceTransformer(language_model)
    logger.info(f"COMPLETED: {progression_messages['load_model']}")
    print_progress_message("load_model", "DONE")
    time_stamps.append(
        TimeStamp(name=progression_messages["load_model"], time=int(time.time()))
    )
    return model


def embed_responses(responses: list[str], model: SentenceTransformer) -> np.ndarray:
    logger.info(f"STARTED: {progression_messages['embed_responses']}")
    print_progress_message("embed_responses", "STARTED")
    norm_embeddings = model.encode(
        responses, normalize_embeddings=True, convert_to_numpy=True
    )  # shape (no_of_unique_responses, embedding_dim)
    norm_embeddings = np.array(norm_embeddings)  # Type casting (only for IDE)
    logger.info(f"COMPLETED: {progression_messages['embed_responses']}")
    print_progress_message("embed_responses", "DONE")
    time_stamps.append(
        TimeStamp(name=progression_messages["embed_responses"], time=int(time.time()))
    )
    return norm_embeddings


def detect_outliers(
    responses: list[str],
    norm_embeddings: np.ndarray,
    outlier_k: int,
    z_score_threshold: float,
) -> tuple[list[dict], list[str], np.ndarray]:
    logger.info(f"STARTED: {progression_messages['detect_outliers']}")
    print_progress_message("detect_outliers", "STARTED")
    # compute the overall cosine similarity matrix between all embeddings
    S = np.dot(norm_embeddings, norm_embeddings.T)
    # get the average cosine similarities to the OUTLIER_K nearest neighbors for
    # each response (excluding the response itself). The numpy.partition function helps us
    # with that because it can find the smallest values in an array efficiently.
    # So we use that to find the OUTLIER_K+1 smallest negative similarities,
    # take the second to OUTLIER_K+1 values of those (to exclude the similarity
    # to the response itself), swap the sign again, and take the average.

    # the ordering in the partitions is undefined, indexing the partitioned array directly
    # is not guaranteed to exclude the similarity to the response itself.
    # avg_neighbor_sim = np.mean(
    #     -np.partition(-S, outlier_k + 1, axis=1)[:, 1 : outlier_k + 1], axis=1
    # )

    # we need to sort the partitioned array to get the correct order
    partition = np.partition(-S, outlier_k + 1, axis=1)
    sorted_neighborhood_partition = np.copy(partition)
    sorted_neighborhood_partition[:, : outlier_k + 1] = np.sort(
        partition[:, : outlier_k + 1], axis=1
    )
    avg_neighbor_sim = np.mean(
        -sorted_neighborhood_partition[:, 1 : outlier_k + 1], axis=1
    )

    outlier_threshold = np.mean(avg_neighbor_sim) - z_score_threshold * np.std(
        avg_neighbor_sim
    )

    outlier_stats = []
    outlier_bools = avg_neighbor_sim < outlier_threshold

    outliers = [responses[i] for i in np.where(outlier_bools)[0].tolist()]
    for i, response in enumerate(outliers):
        sim = avg_neighbor_sim[np.where(outlier_bools)[0][i]]
        outlier_stats.append(
            {
                "response": response,
                "similarity": float(sim),
                "threshold": float(outlier_threshold),
            }
        )

    # take only the remaining response
    remaining_indexes = np.where(np.logical_not(outlier_bools))[0]
    responses_remaining: list[str] = []
    for i in remaining_indexes:
        responses_remaining.append(responses[i])

    logger.info(f"COMPLETED: {progression_messages['detect_outliers']}")
    print_progress_message("detect_outliers", "DONE")
    time_stamps.append(
        TimeStamp(name=progression_messages["detect_outliers"], time=int(time.time()))
    )
    logger.debug(f"Number of outliers: {len(outliers)}")
    logger.debug(outlier_stats)
    return outlier_stats, responses_remaining, norm_embeddings[remaining_indexes, :]


def start_clustering(
    embeddings: np.ndarray,
    K: int,
    sample_weights: np.ndarray,
    seed: Optional[int] = None,
):
    logger.info("STARTED: Clustering")
    print_progress_message("cluster", "STARTED")
    clustering = KMeans(n_clusters=K, n_init="auto", random_state=seed)
    clustering.fit(embeddings, sample_weight=sample_weights)
    cluster_idxs = np.copy(clustering.labels_)
    cluster_centers = clustering.cluster_centers_ / np.linalg.norm(
        clustering.cluster_centers_, axis=1, keepdims=True, ord=2
    )
    logger.info("COMPLETED: Clustering")
    print_progress_message("cluster", "DONE")
    return cluster_idxs, cluster_centers


def merge_clusters(
    merge_threshold: float,
    cluster_idxs: np.ndarray,
    cluster_centers: np.ndarray,
    embeddings: np.ndarray,
    sample_weights: np.ndarray,
):
    logger.info(f"STARTED: {progression_messages['merge']}")
    print_progress_message("merge", "STARTED")
    # merge the closest clusters using Agglomorative Clustering
    # until everything is closer than the threshold
    meta_clustering = AgglomerativeClustering(
        n_clusters=None,
        distance_threshold=1.0 - merge_threshold,
        linkage="complete",
        metric="cosine",
    )
    meta_clustering.fit(np.asarray(cluster_centers))

    mergers: list[Merger] = []
    for label in np.unique(meta_clustering.labels_):
        merged = np.where(meta_clustering.labels_ == label)[0]
        if len(merged) > 1:
            S = np.dot(cluster_centers[merged, :], cluster_centers[merged, :].T)
            triu_indices = np.triu_indices(len(S), k=1)
            similarity_pairs = []
            for i, j in zip(triu_indices[0].tolist(), triu_indices[1].tolist()):
                similarity_pairs.append(
                    {"cluster_pair": [merged[i], merged[j]], "similarity": S[i, j]}
                )
            mergers.append(
                Merger(
                    merged_clusters=[
                        Cluster(index=cluster_idx, responses=[])
                        for cluster_idx in merged
                    ],
                    similarity_pairs=similarity_pairs,
                )
            )
    logger.debug(mergers)

    # override the original k-means result with the merged clusters
    K_new = len(np.unique(meta_clustering.labels_))
    for i in range(len(cluster_idxs)):
        cluster_idxs[i] = meta_clustering.labels_[cluster_idxs[i]]

    # re-set the cluster centers to the weighted mean of all their
    # points
    centers_new = np.zeros((K_new, cluster_centers.shape[1]))
    for k in range(K_new):
        in_cluster_k = cluster_idxs == k
        centers_new[k, :] = np.dot(
            sample_weights[in_cluster_k], embeddings[in_cluster_k, :]
        ) / np.sum(sample_weights[in_cluster_k])

    # normalize the cluster centers again to unit length
    cluster_centers = centers_new / np.linalg.norm(
        centers_new, axis=1, keepdims=True, ord=2
    )
    logger.info(f"COMPLETED: {progression_messages['merge']}")
    print_progress_message("merge", "DONE")
    time_stamps.append(
        TimeStamp(name=progression_messages["merge"], time=int(time.time()))
    )
    return cluster_idxs, cluster_centers, mergers


def save_cluster_assignments(
    results_dir: str,
    K: int,
    cluster_idxs: np.ndarray,
    embeddings_normalized: np.ndarray,
    centers_normalized: np.ndarray,
    responses: list[str],
    col_delimiter: str = ",",
):
    output_file = f"{results_dir}/cluster_assignments.csv"
    with open(output_file, "w", encoding="utf-8") as f:
        writer = csv.writer(f, delimiter=col_delimiter, lineterminator="\n")
        writer.writerow(["response", "cluster_index", "similarity_to_center"])
        # similarity to center refers to the distance from embedding to the
        # cluster mean which is a measure of how representative
        # the response is for the cluster

        for k in range(K):
            # get the indices of all responses in cluster k
            in_cluster_k = np.where(cluster_idxs == k)[0]

            if len(in_cluster_k) == 0:
                continue

            # compute the cosine similarity of the embeddings of all responses
            # in cluster k to the mean of cluster k
            sim = np.dot(
                embeddings_normalized[in_cluster_k, :], centers_normalized[k, :]
            )
            # iterate over all responses in cluster k - but sort descendingly
            # by the cosine similarity because we may want to label clusters by
            # the most similar responses
            for i in np.argsort(-sim):
                cluster_col_idx = in_cluster_k[i]
                response = responses[cluster_col_idx]
                k = cluster_idxs[cluster_col_idx]
                s = sim[i].item()
                writer.writerow([response, k, s])


def save_pairwise_similarities(
    results_dir: str,
    centers_normalized: np.ndarray,
    col_delimiter: str = ",",
):
    pairwise_similarities_file = f"{results_dir}/pairwise_similarities.json"
    # compute the pairwise similarities between all cluster centers
    S = np.dot(centers_normalized, centers_normalized.T)

    # # get the indexes of the pair of clusters with the highest similarity
    # S_copy = S.copy()
    # # Set diagonal elements to a value less than 1.0 to exclude them from argmax
    # np.fill_diagonal(S_copy, -1)
    # # Get the index of the maximum value closest to 1.0
    # max_index = np.unravel_index(np.argmax(S_copy, axis=None), S_copy.shape)
    # np.savetxt(pairwise_similarities_file, S, fmt="%.2f", delimiter=col_delimiter)
    output_dict = {}
    for i, row in enumerate(S):
        output_dict[i] = {j: float(sim) for j, sim in enumerate(row) if i != j}
    with open(pairwise_similarities_file, "w") as f:
        json.dump(output_dict, f)


def save_amended_file(
    input_file_name: str,
    results_dir: str,
    responses: list[str],
    rows: list[list[str]],
    selected_columns: list[int],
    delimiter: str,
    has_headers: bool,
    cluster_idxs: np.ndarray,
):
    output_file_path = f"{results_dir}/output.csv"
    response_index_map = {response: idx for idx, response in enumerate(responses)}
    for row in rows[1:]:
        for i in selected_columns:
            # get the next response provided by the current participant
            response = row[i]
            cluster_col_idx = response_index_map.get(response)
            if cluster_col_idx is None:
                row.append("")
                continue
            k = cluster_idxs[cluster_col_idx]
            row.append(k)

    with open(output_file_path, "w", encoding="utf-8") as f:
        writer = csv.writer(f, delimiter=delimiter, lineterminator="\n")
        if has_headers:
            # add the new columns to the header
            logger.debug(f"Original Headers: {rows[0]}")
            logger.debug(f"Selected Columns: {selected_columns}")
            new_header = rows[0].copy()
            for i in selected_columns:
                selected_header = rows[0][i]
                new_header.append(f"{selected_header}_cluster_index")

            # write the header
            writer.writerow(new_header)
        writer.writerows(rows[1:])


def find_number_of_clusters(
    embeddings_normalized: np.ndarray,
    max_num_clusters: int,
    results_dir: str,
    sample_weights: Optional[np.ndarray] = None,
    seed: Optional[int] = None,
) -> int:
    logger.info(f"STARTED: {progression_messages['find_number_of_clusters']}")
    print_progress_message("find_number_of_clusters", "STARTED")
    # set up the list of Ks we want to try
    if max_num_clusters < 50:
        # for max_num_clusters < 50, we try every possible value
        K_values = list(range(2, max_num_clusters + 1))
    elif max_num_clusters < 100:
        # for max_num_clusters >= 50, we try every fifth value
        K_values = list(range(2, 51)) + list(range(55, max_num_clusters + 1, 5))
    else:
        # for max_num_clusters >= 100, we try every tenth value
        K_values = (
            list(range(2, 51))
            + list(range(55, 101, 5))
            + list(range(110, max_num_clusters + 1, 10))
        )

    sils = []
    bics = []
    for K in K_values:
        logger.info(f"Computing K = {K}")
        clustering = KMeans(n_clusters=K, n_init="auto", random_state=seed)
        clustering.fit(embeddings_normalized, sample_weight=sample_weights)
        sil = silhouette_score(np.asarray(embeddings_normalized), clustering.labels_)
        sils.append(sil)
        # compute the BIC score, which is a combination of the distance of each
        # response to its cluster center - provided by the clustering itself -
        bic = -clustering.score(embeddings_normalized)
        # ... and the number of parameters in our model, estimated by K
        bic += K
        bics.append(bic)

    # post-process both scales between 0 and 1 to be easier to
    # read visually
    sils = np.array(sils)
    sils = (sils - np.min(sils)) / (np.max(sils) - np.min(sils))

    bics = -np.array(bics)
    bics = (bics - np.min(bics)) / (np.max(bics) - np.min(bics))

    # identify the number of clusters automatically by selecting
    # the K that achieves the best product of both silhouette score
    # and BIC. The product is chosen to achieve both high silhoutte
    # AND high BIC score.
    K = K_values[np.argmax(sils * bics)]

    plt.plot(K_values, sils)
    plt.plot(K_values, bics)
    plt.plot([K, K], [0, 1], "r--")
    plt.xlabel("number of clusters")
    plt.ylabel("normalized scores")
    plt.legend(["silhouette score", "inverse BIC", "automatic suggestion"])
    plt.savefig(f"{results_dir}/automatic_cluster_count_evaluation.png")

    logger.info(f"COMPLETED: {progression_messages['find_number_of_clusters']}")
    print_progress_message("find_number_of_clusters", "DONE")
    time_stamps.append(
        TimeStamp(
            name=progression_messages["find_number_of_clusters"], time=int(time.time())
        )
    )
    return K


def save_outliers(results_dir: str, outlier_stats: list[dict]):
    outlier_stats.sort(key=lambda x: x["similarity"], reverse=True)
    outliers_file = results_dir + "/outliers.json"
    with open(outliers_file, "w") as f:
        json.dump(outlier_stats, f)


def save_merged_clusters(
    results_dir: str,
    mergers: list[Merger],
    cluster_idxs: np.ndarray,
    centers: np.ndarray,
    embeddings: np.ndarray,
    responses: list[str],
):
    merged_clusters_file = results_dir + "/merged_clusters.json"
    for merger in mergers:
        for cluster in merger.merged_clusters:
            in_cluster = np.where(cluster_idxs == cluster.index)[0]

            if len(in_cluster) == 0:
                continue

            sim = np.dot(embeddings[in_cluster, :], centers[cluster.index, :])
            exemplars = []
            for i in np.argsort(-sim):
                cluster_col_idx = in_cluster[i]
                r = responses[cluster_col_idx]
                s = sim[i].item()
                exemplars.append(Response(response=r, similarity=s))

            cluster.responses = exemplars

    mergers_model: Mergers = Mergers(mergers=mergers)
    with open(merged_clusters_file, "w") as f:
        f.write(mergers_model.model_dump_json(by_alias=True))


def save_timestamps(results_dir: str):
    timestamps_file = results_dir + "/timestamps.json"
    timestamps_model = TimeStamps(time_stamps=time_stamps)
    with open(timestamps_file, "w") as f:
        f.write(timestamps_model.model_dump_json(by_alias=True))


def save_args(
    file_settings: FileSettings,
    algorithm_settings: AlgorithmSettings,
    results_dir: str,
):
    args: Args = Args(
        file_settings=file_settings,
        algorithm_settings=algorithm_settings,
        results_dir=results_dir,
    )
    args_file = results_dir + "/args.json"
    with open(args_file, "w") as f:
        json_args = args.model_dump_json(by_alias=True)
        f.write(json_args)


def print_progress_message(step: str, status: str):
    print(
        f"{ProgressMessage(step=step, status=status, timestamp=datetime.now().isoformat()).model_dump_json(by_alias=True)} ",
        flush=True,
    )
    time.sleep(0.01)


@logger.catch
def main(
    file_settings: FileSettings,
    algorithm_settings: AlgorithmSettings,
    output_dir: str,
):
    advancedOptions = algorithm_settings.advanced_options
    logger.info("Starting clustering")
    time_stamps.append(TimeStamp(name="start", time=int(time.time())))

    logger.info(f"TODO: {progression_messages['process_input_file']}")
    print_progress_message("process_input_file", "TODO")
    logger.info(f"TODO: {progression_messages['load_model']}")
    print_progress_message("load_model", "TODO")
    logger.info(f"TODO: {progression_messages['embed_responses']}")
    print_progress_message("embed_responses", "TODO")

    if (
        advancedOptions.nearest_neighbors is not None
        and advancedOptions.z_score_threshold is not None
    ):
        logger.info(f"TODO: {progression_messages['detect_outliers']}")
        print_progress_message("detect_outliers", "TODO")

    if algorithm_settings.auto_cluster_count:
        logger.info(f"TODO: {progression_messages['find_number_of_clusters']}")
        print_progress_message("find_number_of_clusters", "TODO")

    logger.info(f"TODO: {progression_messages['cluster']}")
    print_progress_message("cluster", "TODO")

    if (
        advancedOptions.similarity_threshold is not None
        and advancedOptions.similarity_threshold < 1.0
    ):
        logger.info(f"TODO: {progression_messages['merge']}")
        print_progress_message("merge", "TODO")

    logger.info(f"TODO: {progression_messages['results']}")
    print_progress_message("results", "TODO")

    responses, response_counts, rows = process_input_file(
        file_settings=file_settings,
        excluded_words=algorithm_settings.excluded_words,
    )

    model = load_model(advancedOptions.language_model)

    embeddings = embed_responses(responses, model)

    if (
        advancedOptions.nearest_neighbors is not None
        and advancedOptions.z_score_threshold is not None
    ):
        outlier_stats, responses_remaining, embeddings = detect_outliers(
            responses,
            embeddings,
            advancedOptions.nearest_neighbors,
            advancedOptions.z_score_threshold,
        )
    else:
        outlier_stats = []
        responses_remaining = responses

    # a list of how often each response was given
    sample_weights = []
    for response in responses_remaining:
        sample_weights.append(response_counts[response])
    sample_weights = np.array(sample_weights)

    ###
    # Moved here for earlier access (needed in find_number_of_clusters)
    if not os.path.exists(output_dir):
        os.mkdir(output_dir)

    input_file_name = os.path.basename(file_settings.path).removesuffix(".csv")
    input_file_name += f"_{time_stamps[0].time}"
    result_dir = os.path.join(output_dir, input_file_name)
    if not os.path.exists(result_dir):
        os.mkdir(result_dir)
    ###

    # find the number of clusters
    if algorithm_settings.auto_cluster_count:
        if not algorithm_settings.max_clusters:
            max_num_clusters = len(responses_remaining) // 2
        else:
            max_num_clusters = min(
                algorithm_settings.max_clusters, len(responses_remaining) // 2
            )
        K = find_number_of_clusters(
            embeddings,
            max_num_clusters,
            result_dir,
            sample_weights,
            algorithm_settings.seed,
        )
    else:
        assert algorithm_settings.cluster_count is not None
        K = algorithm_settings.cluster_count

    cluster_idxs, cluster_centers = start_clustering(
        embeddings, K, sample_weights, algorithm_settings.seed
    )

    pre_merge_cluster_idxs = np.copy(cluster_idxs)
    pre_merge_centers = np.copy(cluster_centers)

    if (
        advancedOptions.similarity_threshold is not None
        and advancedOptions.similarity_threshold < 1.0
    ):
        cluster_idxs, cluster_centers, merged_clusters = merge_clusters(
            advancedOptions.similarity_threshold,
            cluster_idxs,
            cluster_centers,
            embeddings,
            sample_weights,
        )
    else:
        merged_clusters = []

    logger.info(f"STARTED: {progression_messages['results']}")
    print_progress_message("results", "STARTED")

    ###
    ## moved further up
    # if not os.path.exists(output_dir):
    #     os.mkdir(output_dir)

    # input_file_name = os.path.basename(file_settings.path).removesuffix(".csv")
    # input_file_name += f"_{time_stamps[0].time}"
    # result_dir = os.path.join(output_dir, input_file_name)
    # if not os.path.exists(result_dir):
    #     os.mkdir(result_dir)
    ###
    logger.info(f"RESULT_DIR: {os.path.abspath(result_dir)}")
    print(
        f"{RunNameMessage(name=input_file_name).model_dump_json(by_alias=True)} ",
        flush=True,
    )
    time.sleep(0.01)

    save_cluster_assignments(
        result_dir,
        K,
        cluster_idxs,
        embeddings,
        cluster_centers,
        responses_remaining,
        file_settings.delimiter,
    )

    save_pairwise_similarities(result_dir, cluster_centers, file_settings.delimiter)

    save_outliers(result_dir, outlier_stats)

    save_merged_clusters(
        result_dir,
        merged_clusters,
        pre_merge_cluster_idxs,
        pre_merge_centers,
        embeddings,
        responses_remaining,
    )

    save_amended_file(
        input_file_name,
        result_dir,
        responses_remaining,
        rows,
        file_settings.selected_columns,
        file_settings.delimiter,
        file_settings.has_header,
        cluster_idxs,
    )

    save_args(file_settings, algorithm_settings, result_dir)

    # Make sure this syncs with the equivalent on the ProgressPage.tsx
    logger.info(f"COMPLETED: {progression_messages['results']}")
    print_progress_message("results", "DONE")
    time_stamps.append(
        TimeStamp(name=progression_messages["results"], time=int(time.time()))
    )
    save_timestamps(result_dir)

    return result_dir


def validate_args(args):
    if args.nearest_neighbors is not None and args.z_score_threshold is None:
        print("Error: --z_score_threshold must be set if --nearest_neighbors is set.")
        sys.exit(1)
    if args.nearest_neighbors is None and args.z_score_threshold is not None:
        print("Error: --nearest_neighbors must be set if --z_score_threshold is set.")
        sys.exit(1)
    # if args.automatic_k and args.max_num_clusters is None:
    #     print("Error: --max_num_clusters must be set if --automatic_k is set.")
    #     sys.exit(1)
    if not args.automatic_k and args.cluster_count is None:
        print("Error: --cluster_count must be set if --automatic_k is not set.")
        sys.exit(1)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Word Clustering Tool for SocPsych")

    parser.add_argument(
        "path",
        type=str,
        help="Path to the input file",
    )
    parser.add_argument(
        "--output_dir",
        type=str,
        default="output",
        help="Directory to store result directory (default: output)",
    )
    parser.add_argument(
        "--log_dir",
        type=str,
        default="logs/python",
        help="Directory to store log files (default: logs/python)",
    )
    parser.add_argument(
        "--log_level",
        type=str,
        default="INFO",
        help="Log level (default: INFO)",
    )

    # File Settings
    parser.add_argument(
        "--delimiter",
        type=str,
        default=",",
        help="Delimiter used in the input file (default: ,)",
    )
    parser.add_argument(
        "--has_headers",
        action="store_true",
        help="Whether the input file has headers (default: False)",
    )
    parser.add_argument(
        "--selected_columns",
        nargs="+",
        type=int,
        default=[],
        help="List of columns to consider for clustering (default: [])",
    )

    # Algorithm Settings
    parser.add_argument(
        "--automatic_k",
        action="store_true",
        help="Automatically determine the number of clusters",
    )
    parser.add_argument(
        "--max_num_clusters",
        type=int,
        required=False,
        help="Maximum number of clusters to consider. Requires --automatic_k to be set",
    )
    parser.add_argument(
        "--cluster_count",
        type=int,
        required=False,
        help="Number of clusters to create. Does not work if --automatic_k is set",
    )
    parser.add_argument(
        "--seed",
        type=int,
        required=False,
        help="Random seed for reproducibility",
    )
    parser.add_argument(
        "--excluded_words",
        nargs="+",
        default=[],
        help="List of words to exclude from clustering (default: [])",
    )

    # Advanced Options
    parser.add_argument(
        "--language_model",
        type=str,
        default="BAAI/bge-large-en-v1.5",
        help="Language model to use for embedding (default: BAAI/bge-large-en-v1.5)",
    )
    parser.add_argument(
        "--nearest_neighbors",
        type=int,
        required=False,
        help="Number of nearest neighbors to consider for outlier detection",
    )
    parser.add_argument(
        "--z_score_threshold",
        type=float,
        required=False,
        help="Threshold for outlier detection",
    )
    parser.add_argument(
        "--merge_threshold",
        type=float,
        required=False,
        help="Threshold for merging clusters (between 0 and 1)",
    )

    args = parser.parse_args()

    validate_args(args)

    log_level = args.log_level

    logger.remove()
    if args.log_dir:
        logger.add(f"{args.log_dir}/main.log", rotation="10 MB", level=log_level)
    else:
        logger.add("logs/python/main.log", rotation="10 MB", level=log_level)

    fileSettings = FileSettings(
        path=args.path,
        delimiter=args.delimiter,
        has_header=args.has_headers,
        selected_columns=args.selected_columns,
    )
    logger.debug(fileSettings.model_dump_json(by_alias=True))

    outlier_detection: bool = bool(args.nearest_neighbors and args.z_score_threshold)
    agglomerative_clustering: bool = bool(
        args.merge_threshold and args.merge_threshold < 1.0
    )
    advancedOptions = AdvancedOptions(
        outlier_detection=outlier_detection,
        nearest_neighbors=args.nearest_neighbors,
        z_score_threshold=args.z_score_threshold,
        agglomerative_clustering=agglomerative_clustering,
        similarity_threshold=args.merge_threshold,
        language_model=args.language_model,
    )

    algorithmSettings = AlgorithmSettings(
        auto_cluster_count=args.automatic_k,
        max_clusters=args.max_num_clusters,
        cluster_count=args.cluster_count,
        seed=args.seed,
        excluded_words=args.excluded_words,
        advanced_options=advancedOptions,
    )
    logger.debug(algorithmSettings.model_dump_json(by_alias=True))

    result_dir = main(
        file_settings=fileSettings,
        algorithm_settings=algorithmSettings,
        output_dir=args.output_dir,
    )
    if not result_dir:
        sys.exit(1)
