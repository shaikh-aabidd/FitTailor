import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tailor } from "../models/tailor.model.js";
import { User } from "../models/user.model.js";
 
// Create Tailor (Admin Only)
const createTailor = asyncHandler(async (req, res) => {
    const { userId, specialization } = req.body;

    // Validate input
    if (!userId || !specialization) {
        throw new ApiError(400, "User ID and specialization are required");
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Check if user is already a tailor
    const existingTailor = await Tailor.findOne({ user: userId });
    if (existingTailor) {
        throw new ApiError(409, "User is already registered as a tailor");
    }

    // Create tailor profile
    const tailor = await Tailor.create({
        user: userId,
        specialization: Array.isArray(specialization) ? specialization : [specialization],
        availability: true
    });

    // Update user role to tailor
    user.role = "tailor";
    await user.save({ validateBeforeSave: false });

    return res
    .status(201)
    .json(new ApiResponse(201, tailor, "Tailor created successfully"));
});

// Get All Tailors
const getAllTailors = asyncHandler(async (req, res) => {
    const { 
        page = 1, 
        limit = 10, 
        available,
        specialization 
    } = req.query;

    const filter = {};
    if (available) filter.availability = available === "true";
    if (specialization) filter.specialization = specialization;

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 },
        populate: {
            path: "user",
            select: "name email phone"
        }
    };

    const tailors = await Tailor.aggregatePaginate(
        Tailor.aggregate([
            { $match: filter },
            { $project: { __v: 0 } }
        ]), 
        options
    );

    return res
    .status(200)
    .json(new ApiResponse(200, tailors, "Tailors fetched successfully"));
});

// Get Tailor by ID
const getTailorById = asyncHandler(async (req, res) => {
    const { tailorId } = req.params;

    const tailor = await Tailor.findById(tailorId)
        .populate({
            path: "user",
            select: "name email phone addresses"
        })
        .select("-__v");

    if (!tailor) {
        throw new ApiError(404, "Tailor not found");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, tailor, "Tailor details fetched successfully"));
});

// Update Tailor (Admin Only)
const updateTailor = asyncHandler(async (req, res) => {
    const { tailorId } = req.params;
    const { specialization, availability, rating, completedOrders } = req.body;

    const updateData = {};
    if (specialization) updateData.specialization = specialization;
    if (availability !== undefined) updateData.availability = availability;
    if (rating) updateData.rating = rating;
    if (completedOrders) updateData.completedOrders = completedOrders;

    const updatedTailor = await Tailor.findByIdAndUpdate(
        tailorId,
        { $set: updateData },
        { new: true, runValidators: true }
    ).populate("user", "name email");

    if (!updatedTailor) {
        throw new ApiError(404, "Tailor not found");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, updatedTailor, "Tailor updated successfully"));
});

// Delete Tailor (Admin Only)
const deleteTailor = asyncHandler(async (req, res) => {
    const { tailorId } = req.params;

    const tailor = await Tailor.findByIdAndDelete(tailorId)
        .populate("user", "_id");

    if (!tailor) {
        throw new ApiError(404, "Tailor not found");
    }

    // Revert user role to customer
    await User.findByIdAndUpdate(
        tailor.user._id,
        { $set: { role: "customer" } },
        { new: true }
    );

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tailor deleted successfully"));
});

export {
    createTailor,
    getAllTailors,
    getTailorById,
    updateTailor,
    deleteTailor
};