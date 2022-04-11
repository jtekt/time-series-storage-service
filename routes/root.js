const {Router} = require('express')
const {author, name: application_name, version} = require('../package.json')
const {url, bucket, org} = require('../db.js')

const {
  IDENTIFICATION_URL: identification_url,
  AUTHORIZED_GROUPS: authorized_groups,
  GROUP_AUTHORIZATION_URL: group_authentication_url
} = process.env

const router = Router()

router.get('/', (req, res) => {
    res.send({
      application_name,
      author,
      version,
      influxdb: {
        url,
        bucket,
        org
      },
      auth: {
        identification_url,
        group_authentication_url,
        authorized_groups,      
      }
    })
  })


module.exports = router
