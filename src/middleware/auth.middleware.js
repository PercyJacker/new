import  jwt  from "jsonwebtoken";
import { ApiError } from "../utils/Apierror.js";
import { asynchandler } from "../utils/asynchandler.js";
import { User } from "../models/user.model.js";


export const verifyJWT = asynchandler(async(req, res, next)=>{
    const token = req.cookies.accessToken || req.header("authorisation")?.replace("Bearer ", "")

    try {
        if(!token){
            throw new ApiError(401, "Unauthorised request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user =await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        )
    
        if(!user){
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user =user ;
        next()
    } catch (error) {
        throw new ApiError(401,"Invalid Token")
    }
})