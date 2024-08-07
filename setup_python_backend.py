import sys
import subprocess
import venv
import os


def check_python_version():
    if sys.version_info < (3, 7):
        print("Python 3.7 or higher is required.")
        sys.exit(1)


def create_venv():
    venv_dir = ".venv"
    if not os.path.exists(venv_dir):
        print("Creating virtual environment...")
        venv.create(venv_dir, with_pip=True)
    return venv_dir


def get_pip_path(venv_dir):
    if sys.platform == "win32":
        return os.path.join(venv_dir, "Scripts", "pip")
    return os.path.join(venv_dir, "bin", "pip")


def install_requirements(pip_path):
    print("Installing required packages...")
    subprocess.check_call([pip_path, "install", "-r", "requirements.txt"])


def main():
    check_python_version()
    venv_dir = create_venv()
    pip_path = get_pip_path(venv_dir)
    install_requirements(pip_path)
    print("Setup completed successfully. The application is ready to use.")


if __name__ == "__main__":
    main()
