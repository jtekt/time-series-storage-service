import { Router } from "express"
import { author, name as application_name, version } from "../package.json"
import { url, bucket, org } from "../db"
import { Request, Response } from "express"

const {
  IDENTIFICATION_URL: identification_url,
  AUTHORIZED_GROUPS: authorized_groups,
  GROUP_AUTHORIZATION_URL: group_authentication_url,
} = process.env

const router = Router()

router.get("/", (req: Request, res: Response) => {
  res.send({
    application_name,
    author,
    version,
    influxdb: {
      url,
      bucket,
      org,
    },
    auth: {
      identification_url,
      group_authentication_url,
      authorized_groups,
    },
  })
})

export default router
