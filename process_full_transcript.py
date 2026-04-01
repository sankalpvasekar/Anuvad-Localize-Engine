import requests
import json
import os
import time

def process_full_video():
    url = "http://localhost:8000/upload-transcript"
    input_file = "segments.json"
    output_file = "translated_full_script.json"
    
    if not os.path.exists(input_file):
        print(f"Error: {input_file} not found. Run convert_transcript.py first.")
        return
        
    print(f"Loading {input_file} for full video translation...")
    with open(input_file, "r", encoding="utf-8") as f:
        segments = json.load(f)
        
    print(f"Total Segments to process: {len(segments)}")
    print("This may take 1-3 minutes depending on your GPU speed...")
    
    try:
        with open(input_file, "rb") as f:
            files = {"file": (input_file, f, "application/json")}
            data = {"target_lang": "mar_Deva"}
            
            start_time = time.time()
            response = requests.post(url, files=files, data=data)
            end_time = time.time()
            
        if response.status_code == 200:
            print(f"Success! Translation took {end_time - start_time:.2f} seconds.")
            with open(output_file, "wb") as f:
                f.write(response.content)
            print(f"Full translated script saved to '{output_file}'.")
            
            # Preview first 5 items
            result = response.json()
            print("\nPreview of first 5 translated segments:")
            for i, seg in enumerate(result[:5]):
                print(f"[{seg['start']} - {seg['end']}]: {seg['text']}")
        else:
            print(f"Error: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    process_full_video()
