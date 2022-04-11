# Time series storage microservice

This is a simple Node.js application which allows the storage and query of time series datasets in an InfluxDB 2.0 instance via a RESTful API.
Additionally, it can be used with an external authentication API, making it convenient for applications where InfluxDB access credentials cannot be shared.

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
| INFLUXDB_BUCKET  | The name of the InfluxDB bucket |


## Usage examples (Python)

### Point creation
```python
import requests
measurement = 'example'
url = f'http://localhost:7070/measurements/{measurement}'
tags = ['building:main', 'room:lobby']
data = {
    'humidity': 50.3,
    'temperature': 24.7,
}
params = {'tags': tags}
requests.post(url, params=params, json=data)
```

### Points query
```python
import requests
measurement = 'example'
url = f'http://localhost:7070/measurements/{measurement}'
requests.get(url)
```