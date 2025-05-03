import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Measurement } from "../models/measurement.model.js";
import {Order} from "../models/index.js"
import mongoose from "mongoose";
import { User } from "../models/index.js";

// Add New Measurement
const addMeasurement = asyncHandler(async (req, res) => {
    const { 
        profileName,
        chest,
        waist,
        hips,
        shoulderWidth,
        armLength,
        inseam,
        height,
        notes
    } = req.body;

    // Validate required fields
    if (!chest || !waist || !height) {
        throw new ApiError(400, "Chest, waist, and height are required");
    }

    // Create measurement
    const measurement = await Measurement.create({
        user: req.user._id,
        profileName: profileName || "My Measurements",
        chest,
        waist,
        hips,
        shoulderWidth,
        armLength,
        inseam,
        height,
        notes
    });

    await User.findByIdAndUpdate(
        req.user._id,
        { $push: { measurementProfiles: measurement._id } },
        { new: true }
      );


    return res
    .status(201)
    .json(new ApiResponse(201, measurement, "Measurement added successfully"));
});

// Update Measurement
const updateMeasurement = asyncHandler(async (req, res) => {
    const { measurementId } = req.params;
    const updateData = req.body;

    // Validate ownership
    const measurement = await Measurement.findOne({
        _id: measurementId,
        user: req.user._id
    });

    if (!measurement) {
        throw new ApiError(404, "Measurement not found");
    }

    // Update measurement
    const updatedMeasurement = await Measurement.findByIdAndUpdate(
        measurementId,
        updateData,
        { new: true, runValidators: true }
    );

    return res
    .status(200)
    .json(new ApiResponse(200, updatedMeasurement, "Measurement updated"));
});

// Get Measurement by ID
const getMeasurementById = asyncHandler(async (req, res) => {
    const { measurementId } = req.params;

    const measurement = await Measurement.findOne({
        _id: measurementId,
        user: req.user._id
    });

    if (!measurement) {
        throw new ApiError(404, "Measurement not found");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, measurement, "Measurement fetched"));
});

const getAllMeasurements = async (req, res) => {
    try {
      const userId = req.user._id;
  
      const measurements = await Measurement.find({ user: userId }).sort({ createdAt: -1 });
  
      return res
        .status(200)
        .json(new ApiResponse(200, measurements, "Measurements fetched"));
    } catch (error) {
      console.error('Error fetching measurements:', error);
      return res
        .status(500)
        .json(new ApiResponse(500, null, "Failed to fetch measurements"));
    }
  };
  

// Delete Measurement
const deleteMeasurement = asyncHandler(async (req, res) => {
    const { measurementId } = req.params;
    
    // Check for orders using this measurement
    const orderExists = await Order.exists({ 
        measurements: new mongoose.Types.ObjectId(measurementId) 
    });
    
    if (orderExists) {
        throw new ApiError(400, "Measurement is used in active orders");
    }
    
    const measurement = await Measurement.findOneAndDelete({
        _id: measurementId,
        user: req.user._id  // You can remove mongoose.Types.ObjectId wrapper here if req.user._id is already an ObjectId or a valid string.
    });
    
    if (!measurement) {
        throw new ApiError(404, "Measurement not found");
    }
    
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Measurement deleted"));
});


export {
    addMeasurement,
    updateMeasurement,
    getMeasurementById,
    deleteMeasurement,
    getAllMeasurements,
};