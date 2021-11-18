const {url, bucket, org, token} = require('../db.js')
const {influx_read, error_handling} = require('../utils.js')
const {InfluxDB, Point} = require('@influxdata/influxdb-client')


exports.get_measurements = async (req, res) => {

  // List the available measurements in the InfluxDB Bucket

  try {

    let query = `
    import \"influxdata/influxdb/schema\"
    schema.measurements(bucket: \"${bucket}\")
    `

    // Run the query
    const result = await influx_read(query)

    // Extract measurements from result
    const measurements = result.map(r => r._value)

    // Respond to client
    res.send(measurements)

    console.log(`Measurements queried`)
  } catch (error) {
    error_handling(error,res)
  }
}

exports.read_points = async (req, res) => {

  try {
    // measurement name from query parameters

    const {measurement} = req.params

    // Time filters
    const start = req.query.start || '-2d'
    const stop = req.query.stop
    const stop_query = stop ? ('stop: ' + stop) : ''

    // Tags from request query string
    let tags = req.query.tags || []
    // If only one tag provided, will be parsed as string so put it in an array
    if(typeof tags === 'string') tags = [tags]

    // WARNING: Risks of injection
    let query = `
      from(bucket:"${bucket}")
      |> range(start: ${start}, ${stop_query})
      |> filter(fn: (r) => r._measurement == "${measurement}")
    `

    //Adding tags to filter if provided in the query
    tags.forEach(tag => {
      const tag_split = tag.split(':')
      query += `
      |> filter(fn: (r) => r["${tag_split[0]}"] == "${tag_split[1]}")
      `
    })

    // Run the query
    const result = await influx_read(query)

    // Respond to client
    res.send(result)

    console.log(`Measurements of ${measurement} queried`)
  } catch (error) {
    error_handling(error,res)
  }
}

exports.create_points = async (req, res) => {

  try {
    const writeApi = new InfluxDB({url, token}).getWriteApi(org, bucket, 'ns')

    // measurement name from query parameters
    const {measurement} = req.params

    const data = req.body


    // Tags from request query string
    let tags = req.query.tags || []
    if(typeof tags === 'string') tags = [tags]

    // Create point
    let point = new Point(measurement)

    // Add tags
    tags.forEach(tag => {
      const tag_split = tag.split(':')
      point = point.tag(tag_split[0],tag_split[1])
    })

    // Deal with values
    for (const field in data) {
      const value = data[field]
      
      if(field === 'time'){
        // Add time if provided
        point.timestamp(new Date(value))
      }
      else if( (typeof value) === 'number') {
        // float value
        point.floatField(field, parseFloat(value))
      }
      else {
        // String value
        point.stringField(field, value)
      }
    }


    // write
    writeApi.writePoint(point)

    // Close
    await writeApi.close()

    // Respond
    res.send('OK')
    console.log(`Point created in measurement ${measurement}`)

  } catch (error) {
    error_handling(error,res)
  }



}
