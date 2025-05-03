import mongoose,{Schema} from "mongoose";

const notificationSchema = new Schema({
    user: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    type: { 
      type: String, 
      enum: ['order_update', 'promotion', 'tailor_message'] 
    },
  },{timestamps:true});

export const Notification = mongoose.model("Notification",notificationSchema);
