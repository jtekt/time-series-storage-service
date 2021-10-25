import requests

MEASUREMENT = 'python_example'

url = f'http://localhost:7070/measurements/{MEASUREMENT}'

# params = {'tags': ['tag1=v1', 'othertag2=v2']}
params = {'tags': ['tag1=v1']}

body = {'field': 'Temperature', 'value': 33.5}

result = requests.get(url, params=params)

print(result.json())
