const createHttpError = require("http-errors")
const { org, bucket, writeApi, influx_read, deleteApi } = require("../db")

const { parse_csv_points, create_single_point } = require("../utils")

const fieldsFilter = (fields) => {
  let query = ""

  const fieldArray = typeof fields === "string" ? [fields] : fields

  if (fieldArray.length) {
    const fields_joined = fieldArray
      .map((f) => `r["_field"] == "${f}"`)
      .join(" or ")
    query += `|> filter(fn: (r) => ${fields_joined})`
  }

  return query
}

const tagsFilter = (tags) => {
  let query = ""
  const tagArray = typeof tags === "string" ? [tags] : tags
  tagArray.forEach((tag) => {
    const tag_split = tag.split(":")
    query += `|> filter(fn: (r) => r["${tag_split[0]}"] == "${tag_split[1]}")`
  })
  return query
}

exports.read_points = async (req, res, next) => {
  try {
    // measurement name from query parameters
    const { measurement } = req.params

    // Filters
    // Using let because some variable types might change
    let {
      tags = [],
      fields = [],
      start = "0", // by default, query all points
      stop,
      // Limit point count via sampling.
      // Note: This is per field so response will be field count x limit,
      limit = 500,
    } = req.query

    const stop_query = stop ? `stop: ${stop}` : ""

    // NOTE: check for risks of injection
    let query = `
      from(bucket:"${bucket}")
      |> range(start: ${start}, ${stop_query})
      |> filter(fn: (r) => r._measurement == "${measurement}")
      ${fieldsFilter(fields)}
      ${tagsFilter(tags)}
    `

    // subsampling
    // Getting point count to compute the sampling from the limit
    // Note: This is per field so response will be field count x limit,
    const count_query = query + `|> count()`
    const record_count_query_result = await influx_read(count_query)
    const record_count = record_count_query_result[0]?._value // Dirty here
    if (record_count) {
      const sampling = Math.max(Math.round(record_count / Number(limit)), 1)
      query += `|> sample(n:${sampling}, pos: 0)`
    }

    // Run the query
    const points = await influx_read(query)
    console.log(`Points of measurement ${measurement} queried`)

    // Respond to client
    // TODO: also respond with query parameters
    res.send(points)
  } catch (error) {
    next(error)
  }
}

exports.read_latest_point = async (req, res, next) => {
  try {
    const { measurement } = req.params

    // Filters
    // Using let because some variable types might change
    let { tags = [], fields = [] } = req.query

    // NOTE: check for risks of injection
    let query = `
      from(bucket:"${bucket}")
      |> range(start: 0)
      |> filter(fn: (r) => r._measurement == "${measurement}")
      ${fieldsFilter(fields)}
      ${tagsFilter(tags)}
      |> last()
    `

    // Run the query
    const points = await influx_read(query)
    console.log(`Latest point of measurement ${measurement} queried`)

    // Respond to client
    res.send(points[0])
  } catch (error) {
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
    if (req.headers["content-type"] === "text/csv") {
      items = parse_csv_points(body)
      console.log(`Body contains ${items.length} points in CSV format`)
    } else if (Array.isArray(req.body)) {
      items = body
      console.log(`Body contains ${items.length} points JSON format`)
    } else {
      items = [body]
      console.log(`Body contains a single point in JSON format`)
    }

    // Tags from request query string
    // Forgot what this is for
    if (typeof tags === "string") tags = [tags]

    // Add tags
    const default_tags = tags.reduce(
      (prev, tag) => ({ ...prev, [tag.split(":")[0]]: tag.split(":")[1] }),
      {}
    )
    writeApi.useDefaultTags(default_tags)

    // Make list of points
    const points = items.map((data) =>
      create_single_point({ data, tags, measurement })
    )

    // write (flush hereunder is to actually perform the operation)
    writeApi.writePoints(points)

    await writeApi.flush()

    console.log(
      `${points.length} point(s) created in measurement ${measurement}`
    )

    // Respond
    res.send(points)
  } catch (error) {
    next(error)
  }
}

exports.delete_points = async (req, res, next) => {
  // Deleting the whole measurement is achieved by deleting all points

  try {
    const { measurement } = req.params
    const { start = new Date(0), stop = new Date() } = req.query

    await deleteApi.postDelete({
      org,
      bucket,
      body: {
        start,
        stop,
        predicate: `_measurement="${measurement}"`,
      },
    })

    // Respond to client
    res.send({ measurement })

    console.log(
      `Points from ${start} to ${stop} of measurement ${measurement} deleted`
    )
  } catch (error) {
    next(error)
  }
}
