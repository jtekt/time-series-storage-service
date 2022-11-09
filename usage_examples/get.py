import requests

MEASUREMENT = 'dev3'

url = f'http://localhost:7070/measurements/{MEASUREMENT}'

params = {'fields': 'temperature'}

body = {'field': 'Temperature', 'value': 33.5}

result = requests.get(url, params=params)

print(result.json())
