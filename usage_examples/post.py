import requests
import random




measurement = 'python_example_2'
url = f'http://localhost:7070/measurements/{measurement}'
tags = ['tag1:v1', 'othertag2:v2']
data = {
    'humidity': random.uniform(10, 100),
    'temperature': random.uniform(10, 40),
}
params = {'tags': tags}

requests.post(url, params=params, json=data)
