const {queryApi} = require('./db.js')

exports.error_handling = (error, res) => {
  console.error(error)
  let status_code = error.code || 500
  if(typeof status_code !== 'Number') status_code = 500
  const message = error.message || error
  res.status(status_code).send(message)
}

exports.influx_read = (query) => new Promise((resolve, reject) => {
  // helper function for Influx queries

  const results = []
  queryApi.queryRows(query, {
    next(row, tableMeta) {
      // TODO: Find way to convert directly to an array
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
