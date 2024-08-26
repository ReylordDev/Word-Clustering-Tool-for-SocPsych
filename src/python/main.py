from collections import Counter
import os
import csv
from typing import Optional
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.cluster import AgglomerativeClustering, KMeans
from sklearn.metrics import silhouette_score
from loguru import logger
import argparse


def process_input_file(
    path: str,
    delimiter: str,
    has_headers: bool,
    selected_columns: list[int],
    excluded_words: list[str],
):
    logger.info("STARTED: Reading input file")
    rows: list[list[str]] = []
    word_counts: Counter[str] = Counter()
    with open(path, encoding="utf-8") as f:
        reader = csv.reader(f, delimiter=delimiter)
        if has_headers:
            headers = reader.__next__()
            logger.debug(f"Headers: {headers}")
        col_idxs: list[int] = []

        for i in selected_columns:
            col_idxs.append(i)
        logger.debug(f"Column indexes: {col_idxs}")

        for row in reader:
            rows.append(row)

            for column_index in col_idxs:
                # get the next entry provided by the current participant
                response = row[column_index]
                if response == "" or response is None:
                    continue
                # if the word is in the list of forbidden words, ignore it
                if response.strip() in excluded_words:
                    continue
                # otherwise, count the word
                word_counts[response] += 1
    unique_word_count = len(word_counts)
    words = list(word_counts.keys())
    logger.info("COMPLETED: Reading input file")
    logger.debug(f"Number of rows: {len(rows)}")
    logger.debug(f"Number of unique words: {unique_word_count}")

    return words, word_counts, [headers] + rows


def load_model(language_model: str) -> SentenceTransformer:
    logger.info("STARTED: Loading language model")
    model = SentenceTransformer(language_model)
    logger.info("COMPLETED: Loading language model")
    return model


def embed_words(words: list[str], model: SentenceTransformer) -> np.ndarray:
    logger.info("STARTED: Embedding words")
    norm_embeddings = model.encode(
        words, normalize_embeddings=True, convert_to_numpy=True
    )  # shape (no_of_unique_words, embedding_dim)
    norm_embeddings = np.array(norm_embeddings)  # Type casting (only for IDE)
    logger.info("COMPLETED: Embedding words")
    return norm_embeddings


def detect_outliers(
    words: list[str],
    norm_embeddings: np.ndarray,
    outlier_k: int,
    outlier_detection_threshold: float,
) -> tuple[list[str], list[str], np.ndarray]:
    logger.info("STARTED: Outlier detection")
    # compute the overall cosine similarity matrix between all embeddings
    S = np.dot(norm_embeddings, norm_embeddings.T)
    # get the average cosine similarities to the OUTLIER_K nearest neighbors for
    # each word (excluding the word itself). The numpy.partition function helps us
    # with that because it can find the smallest values in an array efficiently.
    # So we use that to find the OUTLIER_K+1 smallest negative similarities,
    # take the second to OUTLIER_K+1 values of those (to exclude the similarity
    # to the word itself), swap the sign again, and take the average.
    avg_neighbor_sim = np.mean(
        -np.partition(-S, outlier_k + 1, axis=1)[:, 1 : outlier_k + 1], axis=1
    )
    outlier_threshold = np.mean(
        avg_neighbor_sim
    ) - outlier_detection_threshold * np.std(avg_neighbor_sim)

    outliers = avg_neighbor_sim < outlier_threshold

    # take only the remaining words
    remaining_indexes = np.where(np.logical_not(outliers))[0]
    words_remaining: list[str] = []
    for i in remaining_indexes:
        words_remaining.append(words[i])

    outliers = list(set(words) - set(words_remaining))
    logger.info("COMPLETED: Outlier detection")
    logger.debug(f"Number of outliers: {len(outliers)}")
    logger.debug(f"Outliers: {outliers}")
    return outliers, words_remaining, norm_embeddings[remaining_indexes, :]


def cluster(
    embeddings: np.ndarray,
    K: int,
    sample_weights: np.ndarray,
    seed: Optional[int] = None,
):
    logger.info("STARTED: Clustering")
    clustering = KMeans(n_clusters=K, n_init=10, random_state=seed)
    clustering.fit(embeddings, sample_weight=sample_weights)
    cluster_idxs = np.copy(clustering.labels_)
    cluster_centers = clustering.cluster_centers_ / np.linalg.norm(
        clustering.cluster_centers_, axis=1, keepdims=True, ord=2
    )
    logger.info("COMPLETED: Clustering")
    return cluster_idxs, cluster_centers


def merge(
    merge_threshold: float,
    cluster_idxs: np.ndarray,
    cluster_centers: np.ndarray,
    embeddings: np.ndarray,
    sample_weights: np.ndarray,
):
    logger.info("STARTED: Merging clusters")
    # merge the closest clusters using Agglomorative Clustering
    # until everything is closer than the threshold
    meta_clustering = AgglomerativeClustering(
        n_clusters=None,
        distance_threshold=1.0 - merge_threshold,
        linkage="complete",
        metric="cosine",
    )
    meta_clustering.fit(np.asarray(cluster_centers))

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
    logger.info("COMPLETED: Merging clusters")
    return cluster_idxs, cluster_centers


def save_clustering_output(
    input_file_name: str,
    output_dir: str,
    K: int,
    cluster_idxs: np.ndarray,
    embeddings_normalized: np.ndarray,
    centers_normalized: np.ndarray,
    words: list[str],
    col_delimiter: str = ",",
):
    clustering_output_file = output_dir + f"/{input_file_name}_clustering_output.csv"
    with open(clustering_output_file, "w", encoding="utf-8") as f:
        writer = csv.writer(f, delimiter=col_delimiter, lineterminator="\n")
        writer.writerow(["word", "cluster_index", "similarity_to_center"])
        # similarity to center refers to the distance from embedding to the
        # cluster mean which is a measure of how representative
        # the word is for the cluster

        for k in range(K):
            # get the indices of all words in cluster k
            in_cluster_k = np.where(cluster_idxs == k)[0]

            if len(in_cluster_k) == 0:
                continue

            # compute the cosine similarity of the embeddings of all words
            # in cluster k to the mean of cluster k
            sim = np.dot(
                embeddings_normalized[in_cluster_k, :], centers_normalized[k, :]
            )
            # iterate over all words in cluster k - but sort descendingly
            # by the cosine similarity because we may want to label clusters by
            # the most similar words
            for i in np.argsort(-sim):
                cluster_col_idx = in_cluster_k[i]
                word = words[cluster_col_idx]
                k = cluster_idxs[cluster_col_idx]
                s = sim[i].item()
                writer.writerow([word, k, s])


def save_pairwise_similarities(
    input_file_name: str,
    output_dir: str,
    centers_normalized: np.ndarray,
    col_delimiter: str = ",",
):
    pairwise_similarities_file = (
        output_dir + f"/{input_file_name}_pairwise_similarities.csv"
    )
    # compute the pairwise similarities between all cluster centers
    S = np.dot(centers_normalized, centers_normalized.T)

    # # get the indexes of the pair of clusters with the highest similarity
    # S_copy = S.copy()
    # # Set diagonal elements to a value less than 1.0 to exclude them from argmax
    # np.fill_diagonal(S_copy, -1)
    # # Get the index of the maximum value closest to 1.0
    # max_index = np.unravel_index(np.argmax(S_copy, axis=None), S_copy.shape)
    np.savetxt(pairwise_similarities_file, S, fmt="%.2f", delimiter=col_delimiter)


def save_amended_file(
    input_file_name: str,
    output_dir: str,
    words: list[str],
    rows: list[list[str]],
    selected_columns: list[int],
    delimiter: str,
    has_headers: bool,
    cluster_idxs: np.ndarray,
):
    output_file_path = output_dir + f"/{input_file_name}_output.csv"
    word_idx_map = {word: idx for idx, word in enumerate(words)}
    for row in rows[1:]:
        for i in selected_columns:
            # get the next word provided by the current participant
            word = row[i]
            cluster_col_idx = word_idx_map.get(word)
            if cluster_col_idx is None:
                row.append("")
                continue
            k = cluster_idxs[cluster_col_idx]
            row.append(k)

    with open(output_file_path, "w", encoding="utf-8") as f:
        writer = csv.writer(f, delimiter=delimiter, lineterminator="\n")
        if has_headers:
            # add the new columns to the header
            for i in selected_columns:
                selected_header = rows[0][i]
                rows[0].append(f"{selected_header}_cluster_index")

            # write the header
            writer.writerow(rows[0])
        writer.writerows(rows[1:])


@logger.catch
def main(
    path: str,
    delimiter: str,
    has_headers: bool,
    selected_columns: list[int],
    excluded_words: list[str],
    language_model: str,
    nearest_neighbors: int,
    z_score_threshold: float,
    automatic_k: bool,
    max_num_clusters: Optional[int],
    seed: Optional[int],
    cluster_count: Optional[int],
    merge_threshold: float,
    output_dir: str,
):
    logger.info("Starting clustering")
    words, word_counts, rows = process_input_file(
        path, delimiter, has_headers, selected_columns, excluded_words
    )

    model = load_model(language_model)

    embeddings = embed_words(words, model)

    outliers, words_remaining, embeddings = detect_outliers(
        words, embeddings, nearest_neighbors, z_score_threshold
    )

    # a list of how often each word was named
    sample_weights = []
    for word in words_remaining:
        sample_weights.append(word_counts[word])
    sample_weights = np.array(sample_weights)

    # find the number of clusters
    if automatic_k:
        if not max_num_clusters:
            max_num_clusters = len(words_remaining) // 2
        K = find_number_of_clusters(embeddings, max_num_clusters, sample_weights, seed)
    else:
        assert (
            cluster_count is not None
        ), "Cluster count must be provided if not automatic"
        K = cluster_count

    cluster_idxs, cluster_centers = cluster(embeddings, K, sample_weights, seed)

    if merge_threshold is not None and merge_threshold < 1.0:
        cluster_idxs, cluster_centers = merge(
            merge_threshold, cluster_idxs, cluster_centers, embeddings, sample_weights
        )

    if not os.path.exists(output_dir):
        os.mkdir(output_dir)

    input_file_name = os.path.basename(path).removesuffix(".csv")
    output_dir = os.path.join(output_dir, input_file_name)
    if not os.path.exists(output_dir):
        os.mkdir(output_dir)

    save_clustering_output(
        input_file_name,
        output_dir,
        K,
        cluster_idxs,
        embeddings,
        cluster_centers,
        words_remaining,
        delimiter,
    )

    save_pairwise_similarities(input_file_name, output_dir, cluster_centers, delimiter)

    save_amended_file(
        input_file_name,
        output_dir,
        words_remaining,
        rows,
        selected_columns,
        delimiter,
        has_headers,
        cluster_idxs,
    )

    # Make sure this syncs with the equivalent on the ProgressPage.tsx
    logger.info("COMPLETED: Clustering complete")


def find_number_of_clusters(
    embeddings_normalized: np.ndarray,
    max_num_clusters: int,
    sample_weights: Optional[np.ndarray] = None,
    seed: Optional[int] = None,
) -> int:
    logger.info("STARTED: Finding number of clusters")
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
        clustering = KMeans(n_clusters=K, n_init=10, random_state=seed)
        clustering.fit(embeddings_normalized, sample_weight=sample_weights)
        sil = silhouette_score(np.asarray(embeddings_normalized), clustering.labels_)
        sils.append(sil)
        # compute the BIC score, which is a combination of the distance of each
        # word to its cluster center - provided by the clustering itself -
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

    logger.info("COMPLETED: Finding number of clusters")
    return K


def output_clustering_results(
    clustering_output_file: str,
    K: int,
    cluster_idxs: np.ndarray,
    embeddings_normalized: np.ndarray,
    centers_normalized: np.ndarray,
    words: list[str],
    col_delimiter: str = ",",
):
    with open(clustering_output_file, "w", encoding="utf-8") as f:
        writer = csv.writer(f, delimiter=col_delimiter, lineterminator="\n")
        writer.writerow(["word", "cluster_index", "similarity_to_center"])
        # similarity to center refers to the distance from embedding to the
        # cluster mean which is a measure of how representative
        # the word is for the cluster

        for k in range(K):
            # get the indices of all words in cluster k
            in_cluster_k = np.where(cluster_idxs == k)[0]

            if len(in_cluster_k) == 0:
                continue

            # compute the cosine similarity of the embeddings of all words
            # in cluster k to the mean of cluster k
            sim = np.dot(
                embeddings_normalized[in_cluster_k, :], centers_normalized[k, :]
            )
            # iterate over all words in cluster k - but sort descendingly
            # by the cosine similarity because we may want to label clusters by
            # the most similar words
            for i in np.argsort(-sim):
                cluster_col_idx = in_cluster_k[i]
                word = words[cluster_col_idx]
                k = cluster_idxs[cluster_col_idx]
                s = sim[i].item()
                writer.writerow([word, k, s])


def output_pairwise_similarities(
    pairwise_similarities_file: str,
    centers_normalized: np.ndarray,
    col_delimiter: str = ",",
):
    # compute the pairwise similarities between all cluster centers
    S = np.dot(centers_normalized, centers_normalized.T)

    # # get the indexes of the pair of clusters with the highest similarity
    # S_copy = S.copy()
    # # Set diagonal elements to a value less than 1.0 to exclude them from argmax
    # np.fill_diagonal(S_copy, -1)
    # # Get the index of the maximum value closest to 1.0
    # max_index = np.unravel_index(np.argmax(S_copy, axis=None), S_copy.shape)
    np.savetxt(pairwise_similarities_file, S, fmt="%.2f", delimiter=col_delimiter)


def output_cluster_indices(
    output_file_path: str,
    num_words_per_row: int,
    col_idxs: list[int],
    out_col_idxs: list[int],
    words: list[str],
    cluster_idxs: np.ndarray,
    rows: list[list[str]],
    headers: list[str],
    col_delimiter: str = ",",
):
    word_idx_map = {word: idx for idx, word in enumerate(words)}
    for user_entry in rows:
        for i in range(num_words_per_row):
            # get the next word provided by the current participant
            word = user_entry[col_idxs[i]]
            cluster_col_idx = word_idx_map.get(word)
            if cluster_col_idx is None:
                user_entry[out_col_idxs[i]] = ""
                continue
            k = cluster_idxs[cluster_col_idx]
            user_entry[out_col_idxs[i]] = k

    with open(output_file_path, "w", encoding="utf-8") as f:
        writer = csv.writer(f, delimiter=col_delimiter, lineterminator="\n")
        writer.writerow(headers)
        writer.writerows(rows)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Word Clustering Tool for SocPsych")
    parser.add_argument(
        "path",
        type=str,
        help="Path to the input file",
    )
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
    parser.add_argument(
        "--excluded_words",
        nargs="+",
        default=[],
        help="List of words to exclude from clustering (default: [])",
    )
    parser.add_argument(
        "--language_model",
        type=str,
        default="BAAI/bge-large-en-v1.5",
        help="Language model to use for embedding (default: BAAI/bge-large-en-v1.5)",
    )
    parser.add_argument(
        "--nearest_neighbors",
        type=int,
        default=5,
        help="Number of nearest neighbors to consider for outlier detection (default: 5)",
    )
    parser.add_argument(
        "--z_score_threshold",
        type=float,
        default=1.0,
        help="Threshold for outlier detection (default: 1.0)",
    )
    parser.add_argument(
        "--automatic_k",
        action="store_true",
        help="Automatically determine the number of clusters",
    )
    parser.add_argument(
        "--max_num_clusters",
        type=int,
        default=100,
        help="Maximum number of clusters to consider (default: 100)",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=None,
        help="Random seed for reproducibility (default: None)",
    )
    parser.add_argument(
        "--cluster_count",
        type=int,
        default=5,
        help="Number of clusters to create (default: 5)",
    )
    parser.add_argument(
        "--merge_threshold",
        type=float,
        default=1.0,
        help="Threshold for merging clusters (default: 1.0)",
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
        default="DEBUG",
        help="Log level (default: INFO)",
    )
    parser.add_argument(
        "--output_dir",
        type=str,
        default="outputs",
        help="Directory to store output files (default: outputs)",
    )

    args = parser.parse_args()

    log_level = args.log_level

    if args.log_dir:
        logger.add(f"{args.log_dir}/main.log", rotation="10 MB", level=log_level)
    else:
        logger.add("logs/python/main.log", rotation="10 MB", level=log_level)

    logger.debug(args)

    main(
        path=args.path,
        delimiter=args.delimiter,
        has_headers=args.has_headers,
        selected_columns=args.selected_columns,
        excluded_words=args.excluded_words,
        language_model=args.language_model,
        nearest_neighbors=args.nearest_neighbors,
        z_score_threshold=args.z_score_threshold,
        automatic_k=args.automatic_k,
        max_num_clusters=args.max_num_clusters,
        seed=args.seed,
        cluster_count=args.cluster_count,
        merge_threshold=args.merge_threshold,
        output_dir=args.output_dir,
    )
