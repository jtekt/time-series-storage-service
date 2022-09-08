const {
  org,
  bucket,
  writeApi,
  influx_read,
  deleteApi
} = require('../db')

const {
  parse_csv_points,
  create_single_point
} = require('../utils')


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
    const measurements = result.map(r => r._value)

    // Respond to client
    res.send(measurements)

    console.log(`Measurements queried`)
  }
  catch (error) {
    next(error)
  }
}

exports.delete_measurement = async (req, res, next) => {

  // Delete one measurement in the InfluxDB bucket

  try {

    const {measurement} = req.params

    const stop = new Date()
    const start = new Date(0)

    await deleteApi.postDelete({
      org,
      bucket,
      body: {
        start: start.toISOString(),
        stop: stop.toISOString(),
        predicate: `_measurement="${measurement}"`,
      },
    })


    // Respond to client
    res.send({measurement})

    console.log(`Measurement ${measurement} deleted`)
  }
  catch (error) {
    next(error)
  }
}






exports.create_points = async (req, res, next) => {

  try {


    // measurement name from query parameters
    const { measurement } = req.params
    const { body } = req
    let { tags = [] } = req.query

    let items
    if (req.headers['content-type'] === 'text/csv') {
      items = parse_csv_points(body)
      console.log(`Body contains ${items.length} points in CSV format`)
    }
    else if (Array.isArray(req.body) ) {
      items = body
      console.log(`Body contains ${items.length} points JSON format`)
    }
    else {
      items = [body]
      console.log(`Body contains a single point in JSON format`)
    }


    // Tags from request query string
    // Forgot what this is for
    if(typeof tags === 'string') tags = [tags]

    // Add tags
    const default_tags = tags.reduce((prev, tag) => ({ ...prev, [tag.split(':')[0]]: tag.split(':')[1] }), {})
    writeApi.useDefaultTags(default_tags)

    // Make list of points
    const points = items.map(data => create_single_point({ data, tags, measurement }) )

    // write (flush hereunder is to actually perform the operation)
    writeApi.writePoints(points)

    await writeApi.flush()

    console.log(`${points.length} point(s) created in measurement ${measurement}`)

    // Respond
    res.send(points)

  }
  catch (error) {
    next(error)
  }

}


exports.read_points = async (req, res, next) => {

  try {
    // measurement name from query parameters

    const { measurement } = req.params

    // Filters
    // Using let because some variable types might change
    let {
      start = '0', // by default, query all points
      stop,
      tags = [],
      fields = [],
      limit = 500, // Limit point count by default, note: this is approximative
    } = req.query

    const stop_query = stop ? (`stop: ${stop}`) : ''


    // If only one tag provided, will be parsed as string so put it in an array
    if (typeof tags === 'string') tags = [tags]
    if (typeof fields === 'string') fields = [fields]

    // NOTE: check for risks of injection
    let query = `
      from(bucket:"${bucket}")
      |> range(start: ${start}, ${stop_query})
      |> filter(fn: (r) => r._measurement == "${measurement}")
    `

    //Adding fields to filter if provided in the query
    if (fields.length) {
      const fields_joined = fields.map(f => `r["_field"] == "${f}"`).join(' or ')
      query += `|> filter(fn: (r) => ${fields_joined})`
    }

    //Adding tags to filter if provided in the query
    tags.forEach(tag => {
      const tag_split = tag.split(':')
      query += `
      |> filter(fn: (r) => r["${tag_split[0]}"] == "${tag_split[1]}")
      `
    })

    // subsampling
    // Getting point count to compute the sampling from the limit
    const count_query = query + `|> count()`
    const record_count_query_result = await influx_read(count_query)

    const record_count = record_count_query_result[0]?._value // Dirty here
    if (record_count) {
      const sampling = Math.max(Math.round(12 * record_count / (limit)), 1) // Not sure why 12
      // Apply subsampling
      query += `|> sample(n:${sampling})`
    }
    

    // Run the query
    const points = await influx_read(query)

    // Respond to client
    res.send(points)

    console.log(`Measurements of ${measurement} queried`)
  }
  catch (error) {
    next(error)
  }
}

exports.read_latest_point = async (req, res, next) => {

  try {

    const { measurement } = req.params

    // Filters
    // Using let because some variable types might change
    let {
      tags = [],
      fields = [],
    } = req.query


    // If only one tag provided, will be parsed as string so put it in an array
    if (typeof tags === 'string') tags = [tags]
    if (typeof fields === 'string') fields = [fields]

    // NOTE: check for risks of injection
    let query = `
      from(bucket:"${bucket}")
      |> range(start: 0)
      |> filter(fn: (r) => r._measurement == "${measurement}")
    `

    //Adding fields to filter if provided in the query
    if (fields.length) {
      const fields_joined = fields.map(f => `r["_field"] == "${f}"`).join(' or ')
      query += `|> filter(fn: (r) => ${fields_joined})`
    }

    //Adding tags to filter if provided in the query
    tags.forEach(tag => {
      const tag_split = tag.split(':')
      query += `
      |> filter(fn: (r) => r["${tag_split[0]}"] == "${tag_split[1]}")
      `
    })

    query += `|> last()`


    // Run the query
    const points = await influx_read(query)

    // Respond to client
    res.send(points[0])

    console.log(`Measurements of ${measurement} queried`)
  }
  catch (error) {
    next(error)
  }
}