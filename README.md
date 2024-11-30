# Word-Clustering-Tool-for-SocPsych

Desktop interface for clustering free-text responses, using language model embeddings and clustering algorithms. Includes functionality to determine the optimal number of clusters automatically.

Install dependencies with `yarn install`



use `yarn start` to run the app locally.

# Building the app

Activate the virtual environment.

Install python dependencies with `pip install -r requirements.txt`

Compile the python main file:
  `pyinstaller .\src\python\main.py -y --python-option u`

Compile the python first launch file:
  `pyinstaller .\src\python\first_launch.py -y --python-option u`

Move the first launch executable into the dist/main folder and delete the dist/first_launch folder.

Build the Electron app with `yarn run make`.