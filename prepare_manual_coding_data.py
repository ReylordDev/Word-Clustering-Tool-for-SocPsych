import csv
import random

INPUT_PATH = "./example_data/example.csv"
OUTPUT_PATH = "./example_data/prep_example_automatic.csv"
MANUAL_PATH = "./example_data/prep_example_manual.csv"
DELIMITER = ";"
RESPONSE_COUNT = 100

with open(INPUT_PATH, "r") as f:
    reader = csv.reader(f, delimiter=DELIMITER)
    headers = next(reader)
    lines = list(reader)


# SCG Play Reasons
lines = [line[7:] for line in lines]

# Shuffle list
random.shuffle(lines)
for line in lines:
    random.shuffle(line)

# Remove empty entries
lines = [line for line in lines if any(line)]

# Write to file
with open(OUTPUT_PATH, "w") as f:
    writer = csv.writer(f, delimiter=",", lineterminator="\n")
    writer.writerow(headers[7:])
    writer.writerows(lines[: int(RESPONSE_COUNT / 3)])

# Flatten list
entries = [item for sublist in lines for item in sublist if item][:RESPONSE_COUNT]

# Write to file
with open(MANUAL_PATH, "w") as f:
    writer = csv.writer(f, delimiter=",", lineterminator="\n")
    writer.writerow(["entry", "cluster"])
    writer.writerows([[entry, ""] for entry in entries])
