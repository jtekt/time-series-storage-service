const {InfluxDB} = require('@influxdata/influxdb-client')
const dotenv = require('dotenv')

dotenv.config()

const url = process.env.INFLUXDB_URL
const token = process.env.INFLUXDB_TOKEN
const org = process.env.INFLUXDB_ORG
const bucket = process.env.INFLUXDB_BUCKET


const writeApi = new InfluxDB({url, token}).getWriteApi(org, bucket, 'ns')
const queryApi = new InfluxDB({url, token}).getQueryApi(org)

exports.url = url
exports.org = org
exports.bucket = bucket
exports.writeApi = writeApi
exports.queryApi = queryApi