import dotenv from "dotenv"
import { InfluxDB, WritePrecisionType } from "@influxdata/influxdb-client"
import { DeleteAPI } from "@influxdata/influxdb-client-apis"
import { Agent } from "http"

const agent = new Agent({
  keepAlive: true,
  keepAliveMsecs: 20 * 1000, // 20 seconds keep alive
})

dotenv.config()

export const {
  INFLUXDB_URL: url = "http://localhost:8086",
  INFLUXDB_TOKEN: token,
  INFLUXDB_ORG: org = "myOrg",
  INFLUXDB_BUCKET: bucket = "mqtt_logger",
  PRECISION: precision = "ns",
} = process.env

const influxDb = new InfluxDB({
  url,
  token,
  transportOptions: { agent },
})

export const writeApi = influxDb.getWriteApi(
  org,
  bucket,
  precision as WritePrecisionType
)
export const queryApi = influxDb.getQueryApi(org)
export const deleteApi = new DeleteAPI(influxDb)

export const influx_read = (query: string) =>
  new Promise((resolve, reject) => {
    // helper function for Influx queries

    // TODO: find type
    const results: any[] = []
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
