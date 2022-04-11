const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const auth = require('@moreillon/express_identification_middleware')
const group_auth = require('@moreillon/express_group_based_authorization_middleware')
const root_router = require('./routes/root.js')
const measurements_router = require('./routes/measurements.js')
const { version, author } = require('./package.json')

dotenv.config()

console.log(`InfluxDB CRUD REST API v${version}`);

const {
  APP_PORT = 80,
  IDENTIFICATION_URL,
  AUTHORIZED_GROUPS,
  GROUP_AUTHORIZATION_URL
} = process.env

const app = express()
app.use(express.json())
app.use(cors())

app.use('/', root_router)


if(IDENTIFICATION_URL){
  console.log(`[Auth] Enabling authentication`)
  const auth_options = { url: IDENTIFICATION_URL }
  app.use(auth(auth_options))
}


if(AUTHORIZED_GROUPS && GROUP_AUTHORIZATION_URL) {
  console.log(`[Auth] Enabling group-based authorization`)
  const group_auth_options = {
    url: GROUP_AUTHORIZATION_URL,
    groups: AUTHORIZED_GROUPS.split(',')
  }
  app.use(group_auth(group_auth_options))
}


app.use('/measurements', measurements_router)

app.listen(APP_PORT, () => {
  console.log(`[Express] listening on port ${APP_PORT}`);
})

// Export for testing
exports.app = app
