const {writeApi,queryApi, bucket} = require('../db.js')
const {Point} = require('@influxdata/influxdb-client')

function influx_read(query) {
    return new Promise((resolve, reject) => {

        const result = []
        queryApi.queryRows(query, {
            next(row, tableMeta) {
                const {
                    _time: time,
                    _field: field,
                    _value: value,
                    _measurement: measurement

                } = tableMeta.toObject(row)
                result.push({
                    time,
                    field,
                    value,
                    measurement,

                })
            },
            error(error) {
                reject(error)
            },
            complete() {
                resolve(result)
            },
        })
    })
    

}


exports.read_points = async (req, res) => {
    const {measurement} = req.params
    const query = `
        from(bucket:"${bucket}") 
        |> range(start: -1d) 
        |> filter(fn: (r) => r._measurement == "${measurement}")
    `
    const result = await influx_read(query)
    res.send(result)
    
}

exports.create_points = async (req, res) => {
    const {measurement} = req.params
    const tag_name = 'my_tag'
    const tag_value = 'test'
    const {value} = req.body
    const point = new Point(measurement)
        .tag(tag_name, tag_value)
        .floatField('value', parseFloat(value))

    writeApi.writePoint(point)
}