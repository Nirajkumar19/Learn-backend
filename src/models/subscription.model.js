import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    subscriber:{ //User who is subscribe a channel
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    channel:{ //Channel which is subscribe by the user, and we are taking the type as User because Channel is a also a User.
        type: mongoose.Types.ObjectId,
        ref: "User"
    }
},{timestamps: true})

export const Subscription = mongoose.model("Subscription",subscriptionSchema);