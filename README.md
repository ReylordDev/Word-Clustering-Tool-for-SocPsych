# Word-Clustering-Tool-for-SocPsych

Desktop interface for clustering free-text response data, using large language model embeddings and clustering algorithms. Includes functionality to determine the optimal number of clusters automatically.

Available on Windows & Linux. Refer to Releases section for downloads.

Created for my bachelor's thesis. Read the [final paper](lklocke_thesis.pdf).

## Screenshots

![File Selection](https://github.com/user-attachments/assets/d27d70f9-fd31-485d-8ef3-b5a0788d6dd0)
![File Preview](https://github.com/user-attachments/assets/2216ed48-40b7-47d5-8520-645059f88549)
![Algorithm Settings](https://github.com/user-attachments/assets/e0ea6740-b604-43f0-aeec-29d2e285f325)
![Algorithm Settings - Excluded Words](https://github.com/user-attachments/assets/3cdb4525-80bc-4208-8d20-8d78a7807752)
![Algorithm settings - Advanced Options](https://github.com/user-attachments/assets/3d753984-4d01-41de-9978-63a758dd23e2)
![Progress](https://github.com/user-attachments/assets/c1883018-5458-4bba-8940-5ab309d67117)
![Results](https://github.com/user-attachments/assets/5b5c3226-9846-4c1c-a590-22840817896e)
![Results - Cluster Assignments](https://github.com/user-attachments/assets/0c1f249c-0225-4484-b4ff-92d43971bef5)
![Results - Cluster Similarities](https://github.com/user-attachments/assets/ff58fbba-d09a-450b-a120-570b8526ef4a)
![Results - Response Outliers](https://github.com/user-attachments/assets/5ffdd7a2-a652-4c09-a8ac-6db31518ec8b)
![Results - Merged Clusters](https://github.com/user-attachments/assets/bea3103f-8433-4ed7-8552-3d93ac0d0910)


## Setup

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


