import { Router } from "express";
import { 
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder
} from "../controllers/order.controller.js"; 

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/adminCheck.middleware.js";
import {upload} from "../middlewares/multer.middleware.js"


const router = Router();

// User routes
router.route("/") 
    .post(verifyJWT,upload.none(),createOrder)       // POST /orders (Create a new order)
    .get(verifyJWT, getAllOrders);      // GET /orders (Get all orders for the user)

router.route("/:orderId")
    .get(verifyJWT, getOrderById);      // GET /orders/:orderId (Get a specific order)

// Admin-only routes
router.route("/:orderId/status")
    .patch(verifyJWT, verifyAdmin,upload.none(), updateOrderStatus); // PATCH /orders/:orderId/status (Update order status)

router.route("/:orderId")
    .delete(verifyJWT, verifyAdmin, deleteOrder);      // DELETE /orders/:orderId (Delete an order)


export default router;