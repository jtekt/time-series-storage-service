const {Router} = require('express')
const {
  get_measurements,
  delete_measurement,
  read_points,
  create_points,
} = require('../controllers/measurements.js')


const router = Router()

router.route('/')
  .get(get_measurements)

router.route('/:measurement')
  .get(read_points)
  .post(create_points)
  .delete(delete_measurement)

module.exports = router
