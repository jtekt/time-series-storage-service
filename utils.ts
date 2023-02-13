import CSV from "csv-string"
import { Point } from "@influxdata/influxdb-client"

// TODO: find type
const beginsWithFloat = (val: any) => {
  val = parseFloat(val)
  return !isNaN(val)
}

// TODO: find type
export const parse_csv_points = (body: any) => {
  return CSV.parse(body, { output: "objects" }).map((item) => {
    return Object.keys(item).reduce((prev, key) => {
      return {
        ...prev,
        [key]:
          key === "time" && beginsWithFloat(item[key])
            ? item[key]
            : parseFloat(item[key]),
      }
    }, {})
  })
}

// TODO: tidy up
export const create_single_point = ({
  data,
  measurement,
}: {
  data: any
  measurement: string
}) => {
  const point = new Point(measurement)

  for (const field in data) {
    const value = data[field]

    if (field === "time") {
      // Add time if provided
      point.timestamp(new Date(value))
    } else if (typeof value === "number") {
      if (!isNaN(value)) {
        // float value
        // TODO: typing
        point.floatField(field, parseFloat(value as any))
      }
    } else {
      // String value
      point.stringField(field, value)
    }
  }

  return point
}
