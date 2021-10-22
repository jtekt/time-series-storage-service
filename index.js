const express = require('express')
const {json} = require('body-parser')
const cors = require('cors')
const dotenv = require('dotenv')
const {author, name: application_name, version} = require('./package.json')
const measurements_router = require('./routes/measurements.js')

dotenv.config()

const app_port = process.env.APP_PORT ?? 80



const app = express()
app.use(json())
app.use(cors())

app.get('/', (req, res) => {
    res.send({
      application_name,
      author,
      version,
    })
  })


app.use('/measurements', measurements_router)


  // Start server
app.listen(app_port, () => {
    console.log(`InfluxDB REST API v${version} listening on port ${app_port}`);
  })
  