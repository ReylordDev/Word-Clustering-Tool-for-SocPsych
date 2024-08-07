# Check if Python is installed
if (Get-Command python -ErrorAction SilentlyContinue) {
    Write-Host "Python is installed. Running setup script..."
    python setup_python_backend.py
}
else {
    Write-Host "Python is not installed. Please install Python 3.7 or higher and try again."
    exit 1
}