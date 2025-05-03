// routes/cart.routes.js
import express from "express";
import { addToCart, removeFromCart,updateCartItem,getCartItems, clearCart } from "../controllers/cart.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verifyJWT); // All cart routes require authentication

router.route("/")
  .post(addToCart)
  .get(getCartItems)
  .delete(clearCart);

router.route("/:productId")
  .delete(removeFromCart)
  .patch(updateCartItem);

export default router;