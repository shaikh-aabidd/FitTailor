import mongoose,{Schema} from "mongoose";

const deliverySchema = new Schema({
    order: { 
      type: Schema.Types.ObjectId, 
      ref: 'Order', 
      required: true 
    },
    trackingNumber: String,
    carrier: { type: String, enum: ['FedEx', 'UPS', 'DHL'] },
    estimatedDelivery: Date,
    deliveredAt: Date
  });

export const Delivery = mongoose.model("Delivery",deliverySchema);
