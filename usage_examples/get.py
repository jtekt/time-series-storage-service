import requests

MEASUREMENT = 'python_example_2'

url = f'http://localhost:7070/measurements/{MEASUREMENT}'

# params = {'tags': ['tag1=v1', 'othertag2=v2']}
#params = {'tags': ['tag1=v1']}
# params = {'fields': ['temperature','humidity']}
params = {'fields': 'temperature'}

body = {'field': 'Temperature', 'value': 33.5}

result = requests.get(url, params=params)

print(result.json())
