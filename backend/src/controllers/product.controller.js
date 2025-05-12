import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Product } from "../models/product.model.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import mongoose from "mongoose";
// Create New Product (Admin Only)
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    fabricType,
    category,
    stock,
    designOptions,
  } = req.body;

  console.log("create PRoduct ",req.body)

  // Validate required fields
  if (
    !name ||
    (typeof name === "string" && name.trim() === "") ||
    price == null || // check for undefined or null
    !fabricType ||
    (typeof fabricType === "string" && fabricType.trim() === "") ||
    !category ||
    (typeof category === "string" && category.trim() === "")
  ) {
    throw new ApiError(
      400,
      "Name, Price, Fabric Type and Category are required"
    );
  }

  // Check product already exist
  const productExist = await Product.exists({ name });
  if (productExist)
    throw new ApiError(400, "Product with the same name already exist");

  // Handle image upload
  const images = [];
  if (
    req.files &&
    Array.isArray(req.files.images) &&
    req.files.images.length > 0
  ) {
    for (const file of req.files.images) {
      const result = await uploadOnCloudinary(file.path);
      images.push(result.url);
    }
  }

  // Create product
  const product = await Product.create({
    name,
    description: description || "",
    price,
    fabricType,
    images,
    stock: stock || 0,
    category,
    designOptions: designOptions || {
      collarStyles: [],
      sleeveTypes: [],
    },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, product, "Product created successfully"));
});

// Get All Products
const getAllProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category, fabricType } = req.query;
  const filter = {};

  // 1. Exclude “custom” products by default
  //    If the client really wants only custom, they can pass `category=custom`
  if (category) {
    filter.category = category; 
  } else {
    filter.category = { $ne: 'custom' };
  }

  // 2. Fabric‐type support (single, comma‐list, or array)
  if (fabricType) {
    if (Array.isArray(fabricType)) {
      filter.fabricType = { $in: fabricType };
    } else if (typeof fabricType === 'string') {
      const parts = fabricType.split(',').map(s => s.trim()).filter(Boolean);
      filter.fabricType = parts.length > 1 ? { $in: parts } : parts[0];
    }
  }

  const options = {
    page:   parseInt(page,  10),
    limit:  parseInt(limit, 10),
    sort:   { createdAt: -1 },
  };

  const products = await Product.aggregatePaginate(
    Product.aggregate([
      { $match: filter },
      { $project: { __v: 0 } }
    ]),
    options
  );

  return res
    .status(200)
    .json(new ApiResponse(200, products, "Products fetched successfully"));
});

// Get Single Product by ID
const getProductById = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!productId) {
    throw new ApiError(400, "Product ID is required");
  }

  const product = await Product.findById(productId).select("-__v");

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product fetched successfully"));
});

// Update Product (Admin Only)
const updateProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const updatedData = req.body;
  if (!productId) {
    throw new ApiError(400, "Product ID is required");
  }
  console.log("Updated Data",updatedData)
  // Handle image updates
  if (req.files && req.files.images) {
    const images = [];
    for (const file of req.files.images) {
      const result = await uploadOnCloudinary(file.path);
      images.push(result.url);
    }
    updatedData.images = images;
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    { $set: updatedData },
    { new: true, runValidators: true }
  ).select("-__v");

  if (!updatedProduct) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedProduct, "Product updated successfully"));
});

// Delete Product (Admin Only)
const deleteProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  // 1) Validate ID
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid Product ID");
  }

  // 2) Find the product
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // 3) Remove it from the database
  await Product.findByIdAndDelete(productId);

  // 4) Delete each image from Cloudinary in parallel
  if (product.images && product.images.length > 0) {
    await Promise.all(
      product.images.map((imgUrl) => deleteFromCloudinary(imgUrl))
    );
  }

  // 5) Respond
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Product deleted successfully"));
});

const createCustomProduct = asyncHandler(async (req, res) => {
  const {
    fabricId,       // this is just the fabricType enum (e.g. 'cotton')
    collarStyle,    // e.g. 'classic'
    sleeveStyle,    // e.g. 'short'
    tailorId,       // optional, can be null for now
    addOns = [],    // array of strings
    price           // number
  } = req.body
  console.log("🔨 ",req.body)
  // validate
  if (!fabricId || !collarStyle || !sleeveStyle || typeof price !== 'number') {
    throw new ApiError(400, 'fabricId, collarStyle, sleeveStyle and price are required')
  }

  // create a “stub” product
  const custom = await Product.create({
    name:           `Custom ${collarStyle} + ${sleeveStyle}`,
    description:    `Custom unstitched piece, fabric: ${fabricId}`,
    price,
    fabricType:     fabricId,
    images:         [],          // if you have any placeholders you can add here
    stock:          1,           // not directly salable
    category:       'custom',
    designOptions:  {
      collarStyles: [ collarStyle ],
      sleeveTypes:  [ sleeveStyle ]
    },
    // you could stash your addOns & tailorId in a “metadata” field,
    // but for now just let your order record it
  })

  res
    .status(201)
    .json(new ApiResponse(201, custom, 'Custom product created'))
})

export {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  createCustomProduct
};
