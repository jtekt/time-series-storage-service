import requests
import random




measurement = 'delete_example'

url = f'http://localhost:7070/measurements/{measurement}/points'

# Upload point
data = { 'temperature': random.uniform(10, 40), }
headers = { 'Authorization': 'Bearer YOUR TOKEN'}
requests.post(url, json=data, headers=headers)

# Get the latest point time
response = requests.get(url)
last_point_time = response.json()[-1]['_time']

# Delete the point
params = {'start': last_point_time, 'stop': last_point_time}
response = requests.delete(url, params=params)
print(response.text)
