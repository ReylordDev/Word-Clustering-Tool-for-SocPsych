import argparse
import sys
import subprocess
import venv
import os


def check_python_version():
    if sys.version_info < (3, 7):
        print("Python 3.7 or higher is required.")
        sys.exit(1)


def create_venv(data_dir=None):
    venv_dir = ".venv"
    if data_dir is not None:
        venv_dir = os.path.join(data_dir, venv_dir)
    if not os.path.exists(venv_dir):
        print("Creating virtual environment in", venv_dir)
        venv.create(venv_dir, with_pip=True)
    return venv_dir


def get_pip_path(venv_dir):
    if sys.platform == "win32":
        return os.path.join(venv_dir, "Scripts", "pip")
    return os.path.join(venv_dir, "bin", "pip")


def install_requirements(pip_path):
    print("Installing required packages...")
    subprocess.check_call([pip_path, "install", "-r", "requirements.txt"])


def main(data_dir=None):
    check_python_version()
    venv_dir = create_venv(data_dir)
    pip_path = get_pip_path(venv_dir)
    install_requirements(pip_path)
    print("Setup completed successfully. The application is ready to use.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Word Clustering Tool for SocPsych")
    parser.add_argument(
        "--data_dir",
        help="Directory to store the virtual environment and the downloaded data",
    )
    args = parser.parse_args()
    main(args.data_dir)
