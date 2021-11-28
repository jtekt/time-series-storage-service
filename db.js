const { InfluxDB } = require('@influxdata/influxdb-client')
const { DeleteAPI } = require('@influxdata/influxdb-client-apis')
const dotenv = require('dotenv')

dotenv.config()

const {
    INFLUXDB_URL: url,
    INFLUXDB_TOKEN: token,
    INFLUXDB_ORG: org,
    INFLUXDB_BUCKET: bucket,
    PRECISION: precision = 'ns',
} = process.env




const influxDb = new InfluxDB({url, token})

const writeApi = influxDb.getWriteApi(org, bucket, precision)
const queryApi = influxDb.getQueryApi(org)
const deleteApi = new DeleteAPI(influxDb)



const influx_read = (query) => new Promise((resolve, reject) => {
  // helper function for Influx queries

  const results = []
  queryApi.queryRows(query, {
    next(row, tableMeta) {
      // TODO: Find way to convert directly to an array
      const result = tableMeta.toObject(row)
      results.push(result)
    },
    error(error) {
      reject(error)
    },
    complete() {
      resolve(results)
    },
  })
})


exports.url = url
exports.org = org
exports.bucket = bucket
exports.token = token
exports.queryApi = queryApi
exports.writeApi = writeApi
exports.deleteApi = deleteApi
exports.influx_read = influx_read
