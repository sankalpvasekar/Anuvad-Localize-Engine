import requests

url = "http://localhost:8000/transcribe/"
files = {'file': ('test.mp4', b'dummy content', 'video/mp4')}
data = {'target_languages': '["hi", "en"]'}

response = requests.post(url, files=files, data=data)
print(response.status_code)
print(response.text)
