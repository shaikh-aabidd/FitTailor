import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    createReview,
    getMyReviews,
    getReviewsByProduct, 
    updateReview,
    deleteReview
} from "../controllers/review.controller.js";
import {upload} from "../middlewares/multer.middleware.js"


const router = Router();

// Protected routes
router.use(verifyJWT);

router.route("/product/:productId")
    .post(upload.none(),createReview)
    .get(getReviewsByProduct);

router.route("/me")
    .get(getMyReviews);

router.route("/:reviewId")
    .patch(upload.none(),updateReview)
    .delete(deleteReview);

export default router;