import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { User } from "../models/user.model.js";

// Create New Order
const createOrder = asyncHandler(async (req, res) => {
    const {
        productId,
        measurementId = null,          // no default string
        designChoices = {},            // default to empty object
        deliveryAddress,
        tailorNotes = "",
        quantity=1,
        totalAmount
      } = req.body;

      console.log("🛠  createOrder payload:", req.body);

    // Validate required fields
    // console.log(productId)
    // console.log(measurementId)
    // console.log(deliveryAddress)
    if (!productId || !deliveryAddress) {
      throw new ApiError(400, "Product, measurements, and delivery address are required");
    }

    // Check product availability
    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }
    if (product.stock < 1) {
        throw new ApiError(400, "Product out of stock");
    }

    // Verify user exists
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    let orderData = {
        user: req.user._id,
        product: productId,
        deliveryAddress,
        tailorNotes,
        quantity,
        totalAmount: totalAmount ||product.price * quantity,
        status: 'placed',
      };
      
      // If this is a custom garment…
      if (measurementId) {
        // validate that designChoices has the required fields
        if (!designChoices.collarStyle || !designChoices.sleeveStyle) {
          throw new ApiError(400, 'Design choices are required for a custom order');
        }
        orderData = {
          ...orderData,
          measurements: measurementId,
          designChoices:{
            collar:designChoices.collarStyle,
            sleeves:designChoices.sleeveStyle,
          },
        };
      }

    // Create order
    const order = await Order.create(orderData);
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { orders: order._id } },
      { new: true }    // optional: return the updated user document
    );
    // Update product stock
    product.stock -= 1;
    await product.save({ validateBeforeSave: false });

    return res
    .status(201)
    .json(new ApiResponse(201, order, "Order created successfully"));
});

// Get All Orders (Admin/Tailor)
const getAllOrders = asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 10,
      status,
      user: userIdQuery,
    } = req.query;
  
    const filter = {};
    if (status) filter.status = status;
    if (userIdQuery) filter.user = userIdQuery;
  
    // non‑admins only see their own orders
    if (req.user.role !== 'admin') {
      filter.user = req.user._id;
    }
  
    // build the aggregate pipeline
    const agg = Order.aggregate([
      { $match: filter },
      { $project: { __v: 0 } }    // exclude __v
    ]);
  
    // paginate
    const {
      docs,
      totalDocs,
      limit: lim,
      page: pg,
      totalPages,
    } = await Order.aggregatePaginate(agg, {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
    });
  
    // **manually populate** the docs array
    //   this will replace user/product IDs with the full objects
    await Order.populate(docs, [
      { path: 'user', select: 'name email' },
      { path: 'product', select: 'name price images' },
      // add other populate specs here if needed
    ]);
  
    // send back the paginated + populated result
    return res
      .status(200)
      .json(new ApiResponse(
        200,
        { docs, totalDocs, limit: lim, page: pg, totalPages },
        'Orders fetched successfully'
      ));
  });

// Get Single Order by ID
const getOrderById = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
        .populate("user", "name email")
        .populate("product", "name price images")
        .select("-__v");

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    // Validate ownership
    if (req.user.role !== "admin" && order.user._id.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized access to order");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, order, "Order fetched successfully"));
});

// Update Order Status (Admin/Tailor)
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
        throw new ApiError(400, "Status is required");
    }

    const validStatuses = ["placed", "confirmed", "in_progress", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
        throw new ApiError(400, "Invalid order status");
    }

    const order = await Order.findByIdAndUpdate(
        orderId,
        { status },
        { new: true, runValidators: true }
    ).select("-__v");

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    // Optional: Handle stock update if order is cancelled
    if (status === "cancelled") {
        await Product.findByIdAndUpdate(
            order.product,
            { $inc: { stock: 1 } },
            { new: true }
        );
    }

    return res
    .status(200)
    .json(new ApiResponse(200, order, "Order status updated successfully"));
});

// Delete Order (Admin Only)
const deleteOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await Order.findByIdAndDelete(orderId);

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    // Optional: Restore product stock
    if (order.status !== "cancelled") {
        await Product.findByIdAndUpdate(
            order.product,
            { $inc: { stock: 1 } },
            { new: true }
        );
    }

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Order deleted successfully"));
});

export {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder
};