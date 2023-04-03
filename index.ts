import "express-async-errors"
import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import auth from "@moreillon/express_identification_middleware"
import group_auth from "@moreillon/express_group_based_authorization_middleware"
import root_router from "./routes/root"
import measurements_router from "./routes/measurements"
import { version } from "./package.json"

dotenv.config()

console.log(`Time series storage service v${version}`)

const {
  APP_PORT = 80,
  IDENTIFICATION_URL,
  AUTHORIZED_GROUPS,
  GROUP_AUTHORIZATION_URL,
} = process.env

const app = express()
app.use(express.json({ limit: "50mb" }))
app.use(express.text({ type: "text/*", limit: "50mb" }))
app.use(cors())

app.use("/", root_router)

if (IDENTIFICATION_URL) {
  console.log(`[Auth] Enabling authentication`)
  const auth_options = { url: IDENTIFICATION_URL }
  app.use(auth(auth_options))
}

if (AUTHORIZED_GROUPS && GROUP_AUTHORIZATION_URL) {
  console.log(`[Auth] Enabling group-based authorization`)
  const group_auth_options = {
    url: GROUP_AUTHORIZATION_URL,
    groups: AUTHORIZED_GROUPS.split(","),
  }
  app.use(group_auth(group_auth_options))
}

app.use("/measurements", measurements_router)

app.listen(APP_PORT, () => {
  console.log(`[Express] listening on port ${APP_PORT}`)
})

// Export for testing
export default app
