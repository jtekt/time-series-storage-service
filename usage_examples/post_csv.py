import requests
import random




measurement = 'example_csv_2'
url = f'http://localhost:7070/measurements/{measurement}'
tags = ['tag1:v1', 'othertag2:v2']
params = {'tags': tags}
headers = { 'content-type': 'text/csv'}
data = 'time,temperature,humidty\n2022-08-01,22.3,68.3\n2022-08-02,23.4,63.5'

requests.post(url, params=params, data=data, headers=headers)
