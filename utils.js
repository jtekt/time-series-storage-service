exports.error_handling = (error, res) => {
  console.error(error)
  let status_code = error.code || 500
  if(typeof status_code !== 'Number') status_code = 500
  const message = error.message || error
  res.status(status_code).send(message)
}
