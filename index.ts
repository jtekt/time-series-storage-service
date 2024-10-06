import 'express-async-errors'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import auth from '@moreillon/express_identification_middleware'
import oidcAuth from '@moreillon/express-oidc'
// @ts-ignore
import group_auth from '@moreillon/express_group_based_authorization_middleware'
import root_router from './routes/root'
import measurements_router from './routes/measurements'
import swaggerUi from 'swagger-ui-express'
import swaggerDocument from './swagger-output.json'
import promBundle from 'express-prom-bundle'
import { version } from './package.json'

dotenv.config()

console.log(`Time series storage service v${version}`)

const {
  APP_PORT = 80,
  IDENTIFICATION_URL,
  AUTHORIZED_GROUPS,
  GROUP_AUTHORIZATION_URL,
  OIDC_JWKS_URI,
} = process.env

const promOptions = { includeMethod: true, includePath: true }

const app = express()
app.use(express.json({ limit: '50mb' }))
app.use(express.text({ type: 'text/*', limit: '50mb' }))
app.use(cors())
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use(promBundle(promOptions))

app.use('/', root_router)

if (OIDC_JWKS_URI) {
  console.log(`[Auth] Enabling OIDC authentication with URI ${OIDC_JWKS_URI}`)
  app.use(oidcAuth({ jwksUri: OIDC_JWKS_URI }))
} else if (IDENTIFICATION_URL) {
  console.log(`[Auth] Enabling authentication with URL ${IDENTIFICATION_URL}`)
  app.use(auth({ url: IDENTIFICATION_URL }))
}

if (AUTHORIZED_GROUPS && GROUP_AUTHORIZATION_URL) {
  console.log(`[Auth] Enabling group-based authorization`)
  const group_auth_options = {
    url: GROUP_AUTHORIZATION_URL,
    groups: AUTHORIZED_GROUPS.split(','),
  }
  app.use(group_auth(group_auth_options))
}

app.use('/measurements', measurements_router)

app.listen(APP_PORT, () => {
  console.log(`[Express] listening on port ${APP_PORT}`)
})

// Export for testing
export default app
