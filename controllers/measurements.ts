import { bucket, influx_read } from "../db"
import { Request, Response } from "express"

export const get_measurements = async (req: Request, res: Response) => {
  // List the available measurements in the InfluxDB Bucket

  const query = `
    import \"influxdata/influxdb/schema\"
    schema.measurements(bucket: \"${bucket}\")
    `

  // Run the query
  // TODO: find type
  const result: any = await influx_read(query)

  // Extract measurements from result
  // TODO: find type
  const measurements = result.map((r: any) => r._value)

  // Respond to client
  res.send(measurements)
}
