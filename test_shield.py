import sys
import os
from translator import ScholarShield

def run_tests_from_file(file_path):
    print(f"Loading transcription from: {file_path}\n")
    
    if not os.path.exists(file_path):
        print(f"Error: Could not find file '{file_path}'.")
        print("Please create this file and paste your transcript lines inside, or pass a file path: `python test_shield.py transcript.txt`")
        sys.exit(1)
        
    shield = ScholarShield(domain="physics")
    
    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    for idx, line in enumerate(lines):
        line = line.strip()
        if not line:
            continue  # Skip empty lines
            
        print(f"--- Segment {idx + 1} ---")
        print(f"Original: {line}")
        
        masked, mapping = shield.shield_text(line)
        print(f"Masked:   {masked}")
        if mapping:
            print(f"Mapping:  {mapping}")
            
        unmasked = shield.unshield_text(masked, mapping)
        print(f"Unmasked: {unmasked}\n")

if __name__ == "__main__":
    # If the user provides a file path as an argument, use that. 
    # Otherwise, default to looking for 'transcript.txt' in the same folder.
    if len(sys.argv) > 1:
        target_file = sys.argv[1]
    else:
        target_file = "transcript.txt"
        
    run_tests_from_file(target_file)
