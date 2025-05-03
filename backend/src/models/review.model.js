import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"


const reviewSchema = new Schema({
    user: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    product: { 
      type: Schema.Types.ObjectId, 
      ref: 'Product', 
      required:true,
    },
    tailor: { 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
    },
    rating: { type: Number, min: 1, max: 5 ,required:true},
    comment: {type: String, trim:true},
  },{timestamps:true});

reviewSchema.plugin(mongooseAggregatePaginate);

export const Review = mongoose.model("Review",reviewSchema);
