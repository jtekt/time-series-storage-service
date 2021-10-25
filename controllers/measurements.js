const {queryApi, url, bucket, org, token} = require('../db.js')
const {InfluxDB, Point} = require('@influxdata/influxdb-client')

const error_handling = (error, res) => {
  res.status(500).send(error)
  console.log(error)
}


const influx_read = (query) => {
  // helper function for Influx queries
  return new Promise((resolve, reject) => {

    const results = []
    queryApi.queryRows(query, {
      next(row, tableMeta) {
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
}


exports.read_points = async (req, res) => {

  try {
    // measurement name from query parameters

    const {measurement} = req.params

    // Tags from request query string
    const start = req.query.start || '-1d'
    let tags = req.query.tags || []
    if(typeof tags === 'string') tags = [tags]


    // WARNING: Risks of injection
    let query = `
      from(bucket:"${bucket}")
      |> range(start: ${start})
      |> filter(fn: (r) => r._measurement == "${measurement}")
    `

    // Filter using tags if provided
    tags.forEach(tag => {
      const tag_split = tag.split('=')
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

    // Point field and value from body
    const {field, value, time} = req.body

    if(!field) throw {code: 400, message: 'field not defined'}
    if(!value) throw {code: 400, message: 'value not defined'}

    // Tags from request query string
    let tags = req.query.tags || []
    if(typeof tags === 'string') tags = [tags]

    // Create point
    let point = new Point(measurement)

    // Add tags
    tags.forEach(tag => {
      const tag_split = tag.split('=')
      point = point.tag(tag_split[0],tag_split[1])
    })

    // Add value
    point.floatField(field, parseFloat(value))

    // Add time if provided
    if(time) point.timestamp(new Date(time))

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
