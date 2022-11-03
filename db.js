const { InfluxDB } = require('@influxdata/influxdb-client')
const { DeleteAPI } = require('@influxdata/influxdb-client-apis')
const { Agent } = require('http')
const dotenv = require('dotenv')

dotenv.config()

const agent = new Agent({
  keepAlive: true,
  keepAliveMsecs: 20 * 1000, // 20 seconds keep alive
})


const {
    INFLUXDB_URL,
    INFLUXDB_TOKEN,
    INFLUXDB_ORG,
    INFLUXDB_BUCKET,
    PRECISION = 'ns',
} = process.env


const influxDb = new InfluxDB({
  url: INFLUXDB_URL, 
  token: INFLUXDB_TOKEN,
  transportOptions: {agent}
})

const writeApi = influxDb.getWriteApi(INFLUXDB_ORG, INFLUXDB_BUCKET, PRECISION)
const queryApi = influxDb.getQueryApi(INFLUXDB_ORG)
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


exports.url = INFLUXDB_URL
exports.org = INFLUXDB_ORG
exports.bucket = INFLUXDB_BUCKET
exports.token = INFLUXDB_TOKEN
exports.queryApi = queryApi
exports.writeApi = writeApi
exports.deleteApi = deleteApi
exports.influx_read = influx_read
