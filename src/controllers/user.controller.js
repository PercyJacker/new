//so here we will 


import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/Apierror.js"; 
import { User } from "../models/user.model.js";
import {uploadOnCloudnary} from "../utils/cloudnary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { response } from "express";
import  jwt  from "jsonwebtoken";
import { verifyJWT } from "../middleware/auth.middleware.js";



const generateAccessAndRefreshToken = async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})

        return{accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500,"something went wrong")
        
    }
}



const registerUser = asynchandler(async (req, res )=>{
    console.log("registerUser route hit"); // This will confirm the function is being called
    console.log("Request body: ", req.body); // Log the request body to check data received
    //!main algo
    // get User details from frontend
    // validation - not empty
    // check if User already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create User object - create entry in db
    // remove password and refresh token field from response
    // check for User creation
    // return res

    const {fullname , email, username, password}=req.body
    console.log("email:",email);

    if (
        //if any feild is missing
        [fullname , email , password , username ].some((feild)=>
            feild?.trim() === "")
    ){
        throw new ApiError (400 ,"all feild are required" )
    }
    const existedUser = await User.findOne({
        $or : [{username},{email}]
    })

    if(existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }
    console.log(req.files);
//here we can req files
const coverImagePath = await req.files?.coverImage?.[0]?.path;
const avatarLocalPath = await req.files?.avatar?.[0]?.path;



//another method to upload files
// let coverImagePath;
// if (req.files && Array.isArray(req.files.coverImage && req.files.coverImage.length >0)){
//     coverImagePath = req.files.coverImage[0].path
// }

console.log("Avatar Local Path: ", avatarLocalPath);
console.log("Cover Image Path: ", coverImagePath);


    if (!avatarLocalPath){
        throw new ApiError(400, "avatar file is needed")
    }
//here we upload them on cloudnary
    const avatar = await uploadOnCloudnary(avatarLocalPath)
    const coverImage = await uploadOnCloudnary(coverImagePath)

    if(!avatar){
        throw new ApiError(400, "avatar file is required")

    }
//?object ke liye  ye {}  wal bracket
    const newUser =User.create({
        fullname,
        avatar:avatar.url,
        //agr optional toh left empty
        coverImage:coverImage?.url || " ",
        email,
        password,
        username:username.toLowerCase()
    })

//here we gettting User data excpet passwrd and refrshtoken
    const createdUser =await User.findById(newUser._id).select(
        "-password -refreshToken"
    )
    // console.log("Created User: ", newUser);

    if(!newUser){
        throw new ApiError(500, "something went wrong while registring")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser,"User registered succesfully")
    )



    
})

    //!here we start login page
    //!main algo
    //take mail ,username, pass
    //show error there is no username or email
    //find that in mongoose User if that user exist or not
    //then see if the user is vaild or not
    //generate access and refresh token(make a method of it)
    //send cookies


const loginUser = asynchandler(async(req, res )=>{

    const {email ,username, password} = req.body

    if (!(username || email)) {
        throw new ApiError (400,"username or email is required")
    }

    const user =await User.findOne({
        $or :[{username},{email}]
    })
    if (!user) {
        throw new ApiError(404, "User does not exist");
    }
    

        //user is the return wla bt User is the mongoose wla
    const isPasswordValid =await user.isPasswordCorrect(password)

    if (!isPasswordValid){
        throw new ApiError("invalid password")
    }

    const {accessToken, refreshToken} =await 
    generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findOne(user._id).select
    ("-password -refreshToken")

    const option = {
        httpOnly :true,
        secure : true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken)
    .cookie("refreshToken", refreshToken)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser, accessToken, refreshToken
            },
            "User logged in succesfully"
        )
    )



})

//!here we start logout user
//!main algo
//remove cookies

const logoutUser = asynchandler(async(req, res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new: true
        }


        
    )
    const option = {
        httpOnly :true,
        secure : true
    }
    return res
    .status(200)
    .clearCookie("accessToken",option)
    .clearCookie("refreshToken", option)
    .json(new ApiResponse(200, {}, "User logged out"))
})

//!refresh token
const refreshAccessToken = asynchandler(async(req, res)=>{
    const incomingRefreshToken = req.cookie.
    refreshToken || req.body.refreshToken

    if(incomingRefreshToken){
        throw new ApiError(401, "unauthorised request")
    }

    const decodedToken =jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    )

    const user =User.findById(decodedToken?._id)

    if(!user){
        throw new ApiError(401,"Invalid refresh token")
    }

    if(incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(201, "refresh token is expired")
    }

    const option={
        httpOnly:true,
        secure:true
    }

    const {accessToken, newRefreshToken}=await generateAccessAndRefreshToken(user._id)

    return res
    .status(200)
    .cookie("accessToken",accessToken,option)
    .cookie("refreshToken",newRefreshToken,option)
    .json(
        new ApiResponse(
            200,
            {accessToken,refreshToken:newRefreshToken},
            "access token refreshed"
        )
    )
})



//secured routes







export {registerUser, loginUser ,logoutUser,refreshAccessToken}