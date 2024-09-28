import mongoose, { Schema } from "mongoose";
import mongooseAggregate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema (
    {
        videofile :{
            type : String,//cloudnaryURL
            required : true

        },

        thumbanail :{
            type:String,
            required: true

        },
        tittle : {
            type : String,
            required : true
        },

        description : {
            type : String,
            required : true
        },
        duration : {
            type : Number,
            required : true
        },
        views : {
            type : Number,
            deafault : 0
        },
        isPublished : {
            type : Boolean,
            required : true
        },
        owner : {
            type :Schema.types.objectid,
            ref : "User"
        },
        



    },{
            timestamps:true
        }
)

videoSchema.plugin(mongooseAggregate)

export const video = mongoose.model("video", videoSchema)