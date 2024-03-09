import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";// Use for handle heavy query.

const videoSchema = new mongoose.Schema({
    videoFile:{
        type: String,
        required: true
    },
    thumbnail:{
        type: String,
        required: true
    },
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    duration:{
        type: Number,
        required: true
    },
    views:{
        type: Number,
        default: 0
    },
    isPublished:{
        type: Boolean
    },
    owner:{
        type: mongoose.Types.ObjectId,
        ref: "User"
    }
},{timestamps: true});


videoSchema.plugin(mongooseAggregatePaginate);
export const Video = mongoose.model("Video",videoSchema);