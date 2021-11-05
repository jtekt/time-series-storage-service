import requests
import random

MEASUREMENT = 'python_example'

value = random.uniform(10, 30)
url = f'http://localhost:7070/measurements/{MEASUREMENT}'
params = {'tags': ['tag1:v1', 'othertag2:v2']}
body = {'field': 'Temperature', 'value': value}

requests.post(url, params=params, json=body)
