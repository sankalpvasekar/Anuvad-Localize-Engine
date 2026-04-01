import requests
import json
import os

def test_api_upload():
    url = "http://localhost:8000/upload-transcript"
    
    # Create a dummy JSON transcript
    test_data = [
        {"start": 0.0, "end": 2.0, "text": "Welcome to the physics lecture on differentiation."},
        {"start": 2.1, "end": 5.0, "text": "We will solve the equation x^2 + 5 = 10."},
        {"start": 5.1, "end": 10.0, "text": "Next, let's look at the integral \int x dx."}
    ]
    
    with open("test_input.json", "w") as f:
        json.dump(test_data, f)
        
    print("Testing /upload-transcript endpoint...")
    try:
        with open("test_input.json", "rb") as f:
            files = {"file": ("test_input.json", f, "application/json")}
            data = {"target_lang": "mar_Deva"}
            response = requests.post(url, files=files, data=data)
            
        if response.status_code == 200:
            print("Success! Response received.")
            # Save the result
            with open("test_output_downloaded.json", "wb") as f:
                f.write(response.content)
            print("Downloaded result saved to 'test_output_downloaded.json'.")
            
            # Verify structure
            result = response.json()
            print("\nTranslated Sample Segments:")
            for seg in result:
                print(f"[{seg['start']} - {seg['end']}]: {seg['text']}")
        else:
            print(f"Error: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"Could not connect to server: {e}")
        print("Make sure to run 'python main.py' in a separate terminal before running this test.")

if __name__ == "__main__":
    test_api_upload()
