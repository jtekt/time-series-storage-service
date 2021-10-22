const {queryApi, url, bucket, org, token} = require('../db.js')
const {InfluxDB, Point} = require('@influxdata/influxdb-client')

function influx_read(query) {
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
    const {measurement} = req.params
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

    const {measurement} = req.params
    const {field, value} = req.body

    const tag = {
        name: 'my_tag',
        value: 'test',
    }

    const point = new Point(measurement)
        .tag(tag.name, tag.value)
        .tag('tag 2', 'yes')
        .floatField(field, parseFloat(value))
        .timestamp(new Date())
    
    writeApi.writePoint(point)

    await writeApi.close()

    res.send('OK')
    console.log(`Point created in measurement ${measurement}`)
}