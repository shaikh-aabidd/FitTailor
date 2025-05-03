import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    addMeasurement,
    updateMeasurement,
    getMeasurementById,
    deleteMeasurement,
    getAllMeasurements
} from "../controllers/measurement.controller.js";
import {upload} from "../middlewares/multer.middleware.js"


const router = Router(); 

router.use(verifyJWT);

router.route("/")
    .get(getAllMeasurements)
    .post(upload.none(),addMeasurement);

router.route("/:measurementId")
    .get(getMeasurementById)
    .patch(upload.none(),updateMeasurement)
    .delete(deleteMeasurement);

export default router;