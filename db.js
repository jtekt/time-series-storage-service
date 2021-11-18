const { InfluxDB } = require('@influxdata/influxdb-client')
const dotenv = require('dotenv')

dotenv.config()

const {
    INFLUXDB_URL: url,
    INFLUXDB_TOKEN: token,
    INFLUXDB_ORG: org,
    INFLUXDB_BUCKET: bucket,
    PRECISION: precision = 'ns',
} = process.env


const writeApi = new InfluxDB({url, token}).getWriteApi(org, bucket, precision)
const queryApi = new InfluxDB({url, token}).getQueryApi(org)

exports.url = url
exports.org = org
exports.bucket = bucket
exports.token = token
exports.writeApi = writeApi
exports.queryApi = queryApi