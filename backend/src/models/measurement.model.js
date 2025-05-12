import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const measurementSchema = new Schema({
    user: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    profileName: { type: String, default: 'My Measurements' },
    chest: { type: Number, required: true }, // in inches/cm
    waist: { type: Number, required: true },
    hips: Number,
    shoulderWidth: Number,
    armLength: Number,
    inseam: Number, // For pants
    neck:Number,
    height: { type: Number, required: true },
    notes: String, // e.g., "Broad shoulders"
  },{timestamps:true});

measurementSchema.plugin(mongooseAggregatePaginate);

export const Measurement = mongoose.model("Measurement",measurementSchema);