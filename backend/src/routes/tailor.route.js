import { Router } from "express";
import { 
    createTailor,
    getAllTailors, 
    getTailorById,
    updateTailor,
    deleteTailor
} from "../controllers/tailor.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/adminCheck.middleware.js";
import {upload} from "../middlewares/multer.middleware.js"


const router = Router();

router.route("/")
    .post(verifyJWT, verifyAdmin,upload.none(), createTailor) //todo: add profile image
    .get(getAllTailors);  // Public access for listing

router.route("/:tailorId")
    .get(getTailorById)    // Public access for profile viewing
    .patch(verifyJWT, verifyAdmin,upload.none(), updateTailor)
    .delete(verifyJWT, verifyAdmin, deleteTailor);

export default router;