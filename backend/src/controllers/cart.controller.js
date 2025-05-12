import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import { Product } from "../models/product.model.js";

// Add to Cart Controller
const addToCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.body;

  // Validate input
  if (!productId?.trim() || !mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, 'Valid product ID is required');
  }

  // Check product existence and availability
  const product = await Product.findById(productId);
  if (!product || product.stock < 1) {
    throw new ApiError(404, 'Product not available');
  }

  // Find user with cart data
  const user = await User.findById(userId)
    .select('cart')
    .populate('cart.product', 'stock');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Check if product exists in cart
  const existingItem = user.cart.find(item => 
    item.product._id.equals(productId)
  );

  let updatedUser;

  if (existingItem) {
    // Check stock availability
    if (existingItem.quantity + 1 > product.stock) {
      throw new ApiError(400, 'Exceeds available stock');
    }

    // Increment quantity using arrayFilters
    updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { 'cart.$[elem].quantity': 1 } },
      { 
        arrayFilters: [{ 'elem.product': productId }],
        new: true,
        runValidators: true
      }
    ).populate({
      path: 'cart.product',
      select: 'name price images rating stock',
    });
  } else {
    // Add new item to cart
    updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          cart: {
            product: productId,
            quantity: 1,
            addedAt: new Date()
          }
        }
      },
      { 
        new: true,
        runValidators: true 
      }
    ).populate({
      path: 'cart.product',
      select: 'name price images rating stock',
    });
  }

  res.status(200).json(
    new ApiResponse(
      200,
      updatedUser.cart,
      existingItem ? 'Cart quantity updated' : 'Product added to cart'
    )
  );
});
const getCartItems = asyncHandler(async (req, res) => {
    const userId = req.user._id;
  
    // Get user with populated cart items
    const user = await User.findById(userId).populate({
      path: "cart.product",
      select: "name price images stock",
    });
  
    if (!user) {
      throw new ApiError(404, "User not found");
    }
  
    // Filter out products that might have been removed or deactivated
    const validCartItems = user.cart.filter(
      (item) => item.product !== null
    );
  
    // Update user's cart if any invalid items were filtered out
    if (validCartItems.length !== user.cart.length) {
      await User.findByIdAndUpdate(
        userId,
        { cart: validCartItems },
        { new: true }
      );
    }
  
    return res
      .status(200)
      .json(
        new ApiResponse(
          200, 
          validCartItems,
          "Cart items retrieved successfully"
        )
      );
});

// Delete from Cart Controller
const removeFromCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.params;

  // Validate product ID
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Valid product ID is required");
  }

  // Remove from cart using $pull with correct query
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $pull: { cart: { product: productId } } // Assuming cart items have product reference
    },
    { 
      new: true,
      runValidators: true 
    }
  ).populate({
    path: "cart.product", // Correct population path
    select: "name price images stock"
  });

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  // Check if product was actually removed
  const stillInCart = updatedUser.cart.some(item => 
    item.product._id.equals(productId)
  );
  if (stillInCart) {
    throw new ApiError(400, "Product not found in cart");
  }

  return res.status(200).json(
    new ApiResponse(
      200, 
      { cart: updatedUser.cart }, // Return proper structure
      "Product removed from cart"
    )
  );
});

const updateCartItem = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.params;
  const { quantity } = req.body;
  console.log("Quantity",quantity)
  // Validate inputs
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product ID");
  }

  if (typeof quantity !== "number" || quantity < 1) {
    throw new ApiError(400, "Quantity must be a number greater than 0");
  }

  // Check product existence and stock
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (product.stock !== undefined && product.stock < quantity) {
    throw new ApiError(400, "Insufficient product stock");
  }

  // Update cart quantity using arrayFilters
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: { "cart.$[elem].quantity": quantity }
    },
    {
      arrayFilters: [{ "elem.product": productId }],
      new: true,
      runValidators: true
    }
  ).populate({
    path: "cart.product",
    select: "name price images stock"
  });

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  // Verify the product was in the cart - CORRECTED VERSION
  const cartItem = updatedUser.cart.find(item => item.product._id.equals(productId));
  if (!cartItem) {
    throw new ApiError(404, "Product not found in cart");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser.cart, "Cart quantity updated successfully")
    );
});

const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Ensure the user exists
  const user = await User.findById(userId).select('cart');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Clear the cart
  user.cart = [];
  await user.save();

  // Return the empty cart
  return res
    .status(200)
    .json(new ApiResponse(200, user.cart, 'Cart cleared successfully'));
});

export {addToCart,removeFromCart,getCartItems,updateCartItem,clearCart };