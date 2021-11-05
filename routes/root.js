const {Router} = require('express')
const {author, name: application_name, version} = require('../package.json')
const {url, bucket, org} = require('../db.js')



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
      }
    })
  })


module.exports = router
