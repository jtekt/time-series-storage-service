const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const root_router = require('./routes/root.js')
const measurements_router = require('./routes/measurements.js')
const {
  version,
  author,
} = require('./package.json')

dotenv.config()

const app_port = process.env.APP_PORT ?? 80

const app = express()
app.use(express.json())
app.use(cors())

app.use('/', root_router)
app.use('/measurements', measurements_router)

app.listen(app_port, () => {
  console.log(`InfluxDB REST API v${version} listening on port ${app_port}`);
})
