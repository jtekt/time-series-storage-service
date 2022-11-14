const CSV = require('csv-string')
const { Point } = require('@influxdata/influxdb-client')


const beginsWithFloat = (val) => {
    val = parseFloat(val);
    return !isNaN(val);
}

exports.parse_csv_points = (body) => {
    return CSV
        .parse(body, { output: 'objects' })
        .map(item => {
            return Object.keys(item).reduce((prev, key) => {
                return { ...prev, [key]: (key === 'time' && beginsWithFloat(item[key])) ? item[key] : parseFloat(item[key]) }
            }, {})
        })
}

exports.create_single_point = ({ data, tags, measurement }) => {

    const point = new Point(measurement)

    for (const field in data) {
        const value = data[field]
        
        if(isNaN(value));
        else if (field === 'time') {
            // Add time if provided
            point.timestamp(new Date(value))
        }
        else if ((typeof value) === 'number') {
            // float value
            point.floatField(field, parseFloat(value))
        }
        else {
            // String value
            point.stringField(field, value)
        }
    }

    return point


}
