const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const auth = require('@moreillon/express_identification_middleware')
const group_auth = require('@moreillon/express_group_based_authorization_middleware')
const root_router = require('./routes/root.js')
const measurements_router = require('./routes/measurements.js')
const {
  version,
  author,
} = require('./package.json')

dotenv.config()

const {
  APP_PORT = 80,
  AUTHENTICATION_URL,
  AUTHORIZED_GROUPS,
  GROUP_AUTHORIZATION_URL
} = process.env

const app = express()
app.use(express.json())
app.use(cors())

app.use('/', root_router)
app.use('/measurements', measurements_router)

app.listen(APP_PORT, () => {
  console.log(`InfluxDB REST API v${version} listening on port ${APP_PORT}`);
})

// Export for testing
exports.app = app
