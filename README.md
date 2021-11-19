# InfluxDB CRUD REST API


## API
| Route  | Method | Description |
| --- | --- | --- |
| /measurements  | GET | Get a list of measurements |
| /measurements/MEASUREMENT_NAME  | POST | Register a data point in the measurement |
| /measurements/MEASUREMENT_NAME  | GET | Get points from the measurement |


## Environment variables
| Variable  | Description |
| --- | --- |
| INFLUXDB_URL  | The URL of the InfluxDB instance |
| INFLUXDB_TOKEN  | The access token for the InfluxDB instance |
| INFLUXDB_ORG  | The organization used in the InfluxDB instance |
| INFLUXDB_BUCKET  | The name of the InfluxDB bucket |


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