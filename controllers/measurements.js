const {queryApi, url, bucket, org, token} = require('../db.js')
const {InfluxDB, Point} = require('@influxdata/influxdb-client')

function influx_read(query) {
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

    // measurement name from query parameters

    const {measurement} = req.params

    // Tags from request query string
    const tags = req.query.tags || []

    // TODO: range filters and tags


    const query = `
        from(bucket:"${bucket}") 
        |> range(start: -1d) 
        |> filter(fn: (r) => r._measurement == "${measurement}")
    `
    const result = await influx_read(query)
    res.send(result)
    
}

exports.create_points = async (req, res) => {

    const writeApi = new InfluxDB({url, token}).getWriteApi(org, bucket, 'ns')

    // measurement name from query parameters
    const {measurement} = req.params

    // Point field and value from body
    const {field, value} = req.body

    // Tags from request query string
    const tags = req.query.tags || []

    // Create point
    let point = new Point(measurement)

    // Add tags
    tags.forEach(tag => { point = point.tag(tag.name,tag.value) })

    // Add value
    point.floatField(field, parseFloat(value))
        // .timestamp(new Date())
    
    // write
    writeApi.writePoint(point)

    // Close
    await writeApi.close()

    // Respond
    res.send('OK')
    console.log(`Point created in measurement ${measurement}`)
}