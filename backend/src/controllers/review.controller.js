import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Review } from "../models/review.model.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import mongoose from "mongoose"; 

// Helper function to calculate product ratings
const calculateProductRatings = async (productId) => {
    const result = await Review.aggregate([
        {
            $match: { product: new mongoose.Types.ObjectId(productId) }
        },
        {
            $group: {
                _id: null,
                averageRating: { $avg: "$rating" },
                numberOfReviews: { $sum: 1 }
            }
        }
    ]);

    const updateData = {
        averageRating: result[0]?.averageRating || 0,
        numberOfReviews: result[0]?.numberOfReviews || 0
    };

    await Product.findByIdAndUpdate(productId, updateData);
};

// Create Review
const createReview = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { rating, comment } = req.body;
  
    // Convert to ObjectId
    const productObjectId = new mongoose.Types.ObjectId(productId);
  
    // Check for existing review
    const existingReview = await Review.findOne({
      user: req.user._id,
      product: productObjectId // Use ObjectId here
    });
  
    if (existingReview) {
      throw new ApiError(400, "You have already reviewed this product");
    }
  
    // Check for valid order with ObjectId
    const deliveredOrder = await Order.findOne({
      user: req.user._id,
      product: productObjectId, // Match ObjectId type
      status: "delivered"
    }).select("_id");
  
    if (!deliveredOrder) {
      throw new ApiError(400, "You can only review products you've purchased");
    }
  
    // Create review with ObjectId
    const review = await Review.create({
      user: req.user._id,
      product: productObjectId,
      rating,
      comment
    });
  
    // Update product ratings
    await calculateProductRatings(productId);
  
    return res
      .status(201)
      .json(new ApiResponse(201, review, "Review created successfully"));
  });

// Get User's Reviews
const getMyReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({ user: req.user._id })
        .populate("product", "name images");

    return res
        .status(200)
        .json(new ApiResponse(200, reviews, "User reviews fetched"));
});

// Get Product Reviews
const getReviewsByProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    
    const reviews = await Review.find({ product: productId })
        .populate("user", "name email");

    return res
        .status(200)
        .json(new ApiResponse(200, reviews, "Product reviews fetched"));
});

// Update Review
const updateReview = asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findOneAndUpdate(
        { _id: reviewId, user: req.user._id },
        { rating, comment },
        { new: true, runValidators: true }
    );

    if (!review) {
        throw new ApiError(404, "Review not found");
    }

    // Update product ratings
    await calculateProductRatings(review.product);

    return res
        .status(200)
        .json(new ApiResponse(200, review, "Review updated"));
});

// Delete Review
const deleteReview = asyncHandler(async (req, res) => {
    const { reviewId } = req.params;

    const review = await Review.findOneAndDelete({
        _id: reviewId,
        user: req.user._id
    });

    if (!review) {
        throw new ApiError(404, "Review not found");
    }

    // Update product ratings
    await calculateProductRatings(review.product);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Review deleted"));
});

export {
    createReview,
    getMyReviews,
    getReviewsByProduct,
    updateReview,
    deleteReview
};