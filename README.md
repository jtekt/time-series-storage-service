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
```
url = f'http://localhost:7070/measurements/{MEASUREMENT}'
params = {'tags': ['tag1:v1', 'othertag2:v2']}
body = {'field': 'Temperature', 'value': value}
requests.post(url, params=params, json=body)
```