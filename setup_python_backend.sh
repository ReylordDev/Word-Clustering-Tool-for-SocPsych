#!/bin/bash

# Check if Python is installed
if command -v python3 &>/dev/null; then
    echo "Python 3 is installed. Running setup script..."
    python3 setup_python_backend.py
else
    echo "Python 3 is not installed. Please install Python 3.7 or higher and try again."
    exit 1
fi