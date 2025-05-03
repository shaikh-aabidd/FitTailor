import mongoose ,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const deliveryAddressSchema = new Schema({
  street: { type: String, required: true },
  city:   { type: String, required: true },
  state:  { type: String, required: true },
  zipCode:{ type: String, required: true },
  type: { 
    type: String,
    enum: ['home', 'office', 'other', 'custom'],
    required: true,
    default:"home"
  }
});

const orderSchema = new Schema({
    user: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true  
    },
    product: { 
      type: Schema.Types.ObjectId, 
      ref: 'Product', 
      required: true 
    },
    customDetails: {                                        // new field
      fabricId: { type: Schema.Types.ObjectId, ref: 'Product' },
      collarStyle: String,
      sleeveStyle: String,
      tailorId: { type: Schema.Types.ObjectId, ref: 'User' },
      addOns: [String],
      price: Number,
    },
    measurements: { 
      type: Schema.Types.ObjectId, 
      ref: 'Measurement', 
    },
    assignedTailor: { 
      type: Schema.Types.ObjectId, 
      ref: 'User' // Reference to tailor (role='tailor')
    },
    status: {
      type: String,
      enum: ['placed', 'confirmed', 'in_progress', 'shipped', 'delivered', 'cancelled'],
      default: 'placed'
    },
    totalAmount: { type: Number, required: true },
    paymentId: { type: String }, // From Stripe/PayPal
    deliveryAddress: { 
      type: deliveryAddressSchema, 
      required: true 
    },
    designChoices: {
      type: {
        collar: { type: String, required: true },
        sleeves: { type: String, required: true }
      },
    },
    quantity:{
      type:Number,
      default:1
    }
  },{timestamps:true});

orderSchema.plugin(mongooseAggregatePaginate);

export const Order = mongoose.model("Order",orderSchema);
  