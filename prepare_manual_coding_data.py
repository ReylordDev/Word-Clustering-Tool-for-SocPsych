import random
import csv

INPUT_PATH = "./example_data/example.csv"
OUTPUT_PATH = "./example_data/example_prepared.csv"
DELIMITER = ";"

with open(INPUT_PATH, "r") as f:
    reader = csv.reader(f, delimiter=DELIMITER)
    headers = next(reader)
    lines = list(reader)


# Ignore column 0
lines = [line[1:] for line in lines]

# Flatten list
entries = [item for sublist in lines for item in sublist if item]

# Shuffle list
random.shuffle(entries)

# Write to file
with open(OUTPUT_PATH, "w") as f:
    writer = csv.writer(f, delimiter=",", lineterminator="\n")
    writer.writerow(["entry", "cluster"])
    writer.writerows([[entry, ""] for entry in entries])
