import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"


const userSchema = new Schema({
    username :{
        type:String,
        required: true,
        unique: true,
        lowercase : true,
        trim:true,
        index:true
    },
    email :{
        type:String,
        required: true,
        unique: true,
        lowercase : true,
        trim:true,
        
    },
    fullname :{
        type:String,
        required: true,
        trim:true,
        //index used to search
        index:true
    },
    avatar:{
        type:String,
        required:true
    },
    coverImage:{
        type:String,

    },
    watchhistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"video"

        }
    ],
    password:{
        type:String,
        required:[true, "password is required"]
    },
    refreshToken:{
        type:String,
        
    },
    

},{
        timestamps:true
    })

//this is middleware hook pre(its a hook) which checks just before saveing this model
userSchema.pre("save", async function(next){
    //we want to encrypt password one time only so...
    //chceck if password not modified then move on
    if (!this.isModified("password")) return next();

    
    //encrypt the password using hash with 8 rounds
    this.password =await bcrypt.hash(this.password, 8)
    next()
} )

//here we are making our own method isPasswordCorrect to check the password is correct
userSchema.methods.isPasswordCorrect =async function
(password){
    return await bcrypt.compare(password, this.password)
}


//this method will generate access token 
userSchema.methods.generateAccessToken= function(){
    //this is where jwt encodes the payload data which is id ,email etc
    return jwt.sign(
        {
            _id : this._id,
            email : this.email,
            username : this.username,
            fullname : this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

//same 
userSchema.methods.generateRefreshToken= function(){
    return jwt.sign(
        {
            _id : this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model("User" , userSchema)