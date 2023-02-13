import { Router } from "express"
import { get_measurements } from "../controllers/measurements"
import {
  delete_points,
  create_points,
  read_points,
  read_latest_point,
} from "../controllers/points"

const router = Router()

router.route("/").get(get_measurements)

router
  .route("/:measurement")
  .get(read_points)
  .post(create_points)
  .delete(delete_points)

// aliases
router
  .route("/:measurement/points")
  .get(read_points)
  .post(create_points)
  .delete(delete_points)

router.route("/:measurement/points/latest").get(read_latest_point)

export default router
