import mongoose ,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const productSchema = new Schema({
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    fabricType: { 
      type: String, 
      enum: ['cotton', 'silk', 'wool', 'linen'], 
      required: true 
    },
    images: [String], // URLs from Cloudinary
    stock: { type: Number, default: 0 },
    category: { 
      type: String, 
      enum: ['shirt', 'suit', 'dress', 'pants','unstiched','custom'], 
      required: true 
    },
    designOptions: {
      collarStyles: [String], // e.g., "Spread Collar", "Mandarin Collar"
      sleeveTypes: [String],  // e.g., "Full Sleeve", "Half Sleeve"
      // Add other customizable options (buttons, pockets, etc.)
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    numberOfReviews: {
        type: Number,
        default: 0
    }
  },{timestamps:true});

productSchema.plugin(mongooseAggregatePaginate);  

export const Product = mongoose.model("Product" ,productSchema);

