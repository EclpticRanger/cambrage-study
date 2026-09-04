import json
import random

# 1. Load the data from the JSON file
try:
    with open('links.json', 'r') as file:
        combined_links = json.load(file)
except FileNotFoundError:
    print("Error: Could not find 'links.json'. Make sure it's in the same folder as this script.")
    exit()

# 2. Shuffle the list so they are in a random order
random.shuffle(combined_links)

print(f"Loaded {len(combined_links)} topics for revision. Press Enter to start!\n")
input()

# 3. Loop through the shuffled list one by one
for i, pair in enumerate(combined_links):
    print("Link: " + pair['question'])
    print("Answer Link: " + pair['answer'])
    
    # Check if we've reached the end of the list
    if i >= len(combined_links) - 1:
        print("\nOut of things to revise. Restart the program for more.")
        break
    
    # Wait for the user to press Enter before showing the next one
    input("\nPress Enter for the next topic...")