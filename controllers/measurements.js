const { bucket, influx_read } = require("../db")

exports.get_measurements = async (req, res, next) => {
  // List the available measurements in the InfluxDB Bucket

  try {
    const query = `
    import \"influxdata/influxdb/schema\"
    schema.measurements(bucket: \"${bucket}\")
    `

    // Run the query
    const result = await influx_read(query)

    // Extract measurements from result
    const measurements = result.map((r) => r._value)

    // Respond to client
    res.send(measurements)

    console.log(`Measurements queried`)
  } catch (error) {
    next(error)
  }
}
