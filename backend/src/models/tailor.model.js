import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const tailorSchema = new Schema({
    user: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    specialization: [String], // e.g., ["suits", "dresses"]
    rating: { type: Number, default: 0 },
    completedOrders: { type: Number, default: 0 },
    availability: { type: Boolean, default: true }
  });

tailorSchema.plugin(mongooseAggregatePaginate);

export const Tailor = mongoose.model("Tailor",tailorSchema);
  