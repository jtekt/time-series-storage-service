# InfluxDB CRUD REST API

## Usage examples

### Query using time filter
```
GET /measurements/python_example?start=2021-11-03&stop=2021-11-05
```

### Query using tag filter
```
GET measurements/python_example?tags=fruit:banana&tags=area:tokyo
```

### Point registration (Python)
```python
measurement = 'environment_sensing'
url = f'http://localhost:7070/measurements/{measurement}'
tags = ['building:main', 'room:lobby']
data = {
    'humidity': 50.3,
    'temperature': 24.7,
}
params = {'tags': tags}
requests.post(url, params=params, json=data)
```