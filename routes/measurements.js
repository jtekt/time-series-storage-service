const {Router} = require('express')
const {
  get_measurements,
  read_points,
  create_points} = require('../controllers/measurements.js')


const router = Router()

router.route('/')
  .get(get_measurements)

router.route('/:measurement')
  .get(read_points)
  .post(create_points)

module.exports = router
