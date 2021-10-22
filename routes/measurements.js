const {Router} = require('express')
const {read_points, create_points} = require('../controllers/measurements.js')


const router = Router()


router.route('/:measurement')
  .get(read_points)
  .post(create_points)

module.exports = router
