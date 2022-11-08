const {Router} = require('express')
const {
  get_measurements,
  delete_measurement,
  create_points,
  read_points,
  read_latest_point,
  delete_points
} = require('../controllers/measurements.js')


const router = Router()

router.route('/')
  .get(get_measurements)

router.route('/:measurement')
  .get(read_points)
  .post(create_points)
  .delete(delete_measurement)

// aliases
router.route('/:measurement/points')
  .get(read_points)
  .post(create_points)
  .delete(delete_points)



router.route('/:measurement/points/latest')
  .get(read_latest_point)

module.exports = router
