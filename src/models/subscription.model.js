import mongoose, { Schema } from "mongoose";

const subscriptionSchema =new Schema({
    subscriber:{
        type:Schema.Types.ObjectId,
        ref:"User"
        //normal user
    },
    channel:[
        {
            type:Schema.Types.ObjectId,
            ref:"User"
            //jiska channel h

        }
    ],
},{
    timestamps:true
}

)

export const subscription= mongoose.model("Subscription",subscriptionSchema )