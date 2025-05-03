import { Router } from "express";
import { 
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct, 
    createCustomProduct
} from "../controllers/product.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/adminCheck.middleware.js";
import {upload} from "../middlewares/multer.middleware.js"


const router = Router();

router.route("/")
    .post(verifyJWT, verifyAdmin,
        upload.fields([
            { name: "images", maxCount: 5 }
          ]),
        createProduct)    // POST /products
    .get(getAllProducts);               // GET /products /public access

router.route('/custom') 
    .post(verifyJWT,createCustomProduct)

router.route("/:productId")
    .get(getProductById)                // GET /products/:productId /public access
    .patch(verifyJWT, verifyAdmin,
        upload.fields([
            { name: "images", maxCount: 5 }
          ]),
        updateProduct)   // PATCH /products/:productId
    .delete(verifyJWT, verifyAdmin, deleteProduct); // DELETE /products/:productId

export default router;