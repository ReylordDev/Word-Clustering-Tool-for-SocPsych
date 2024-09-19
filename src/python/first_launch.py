import argparse
import sys
from huggingface_hub import snapshot_download
from huggingface_hub.utils import RepositoryNotFoundError, RevisionNotFoundError
from models import ProgressMessage
from datetime import datetime
import time
from loguru import logger

DEFAULT_MODEL = "BAAI/bge-large-en-v1.5"


def print_progress_message(step: str, status: str):
    print(
        f"{ProgressMessage(step=step, status=status, timestamp=datetime.now().isoformat()).model_dump_json(by_alias=True)} ",
        flush=True,
    )
    time.sleep(0.01)


def main():
    try:
        print_progress_message(step="default_model_download", status="STARTED")
        snapshot_download(
            repo_id=DEFAULT_MODEL, ignore_patterns=["*.bin", "*.onnx"], tqdm_class=None
        )
        print_progress_message(step="default_model_download", status="DONE")
        return True
    except RepositoryNotFoundError as e:
        print_progress_message(step="default_model_download", status="ERROR")
        logger.error(f"RepositoryNotFoundError: {e}")
    except RevisionNotFoundError as e:
        print_progress_message(step="default_model_download", status="ERROR")
        logger.error(f"RevisionNotFoundError: {e}")
    except OSError as e:
        print_progress_message(step="default_model_download", status="ERROR")
        logger.error(f"OSError: {e}")
    except ValueError as e:
        print_progress_message(step="default_model_download", status="ERROR")
        logger.error(f"ValueError: {e}")
    except Exception as e:
        print_progress_message(step="default_model_download", status="ERROR")
        logger.error(f"Unexpected Exception: {e}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Word Clustering Tool for SocPsych")
    parser.add_argument(
        "--log_dir",
        type=str,
        default="logs/python",
        help="Directory to store log files (default: logs/python)",
    )
    args = parser.parse_args()
    logger.remove()
    if args.log_dir:
        logger.add(f"{args.log_dir}/first_launch.log", rotation="10 MB")
    else:
        logger.add("logs/python/first_launch.log", rotation="10 MB")
    result = main()
    if not result:
        sys.exit(1)
