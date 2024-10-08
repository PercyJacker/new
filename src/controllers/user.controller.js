//so here we will make every feature by importing many things from middleware , utils and packages and export it to routes 
//


import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/Apierror.js"; 
import { User } from "../models/user.model.js";
import {uploadOnCloudnary} from "../utils/cloudnary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { response } from "express";
import  jwt  from "jsonwebtoken";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { channel } from "diagnostics_channel";



const generateAccessAndRefreshToken = async(userId)=>{
    try {
        //find a user in the database using the userId
        const user = await User.findById(userId)
        //call method from user and assign to accestoken
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        
        //update the refreshToken field without triggering other validation logic.
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})

        //These tokens are returned to the caller for further use
        return{accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500,"something went wrong")
        
    }
}



const registerUser = asynchandler(async (req, res )=>{
    console.log("registerUser route hit"); // This will confirm the function is being called
    console.log("Request body: ", req.body); // logs the data coming from the client side
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
        //if any feild is missing then trim some extra spaces between feilds
        [fullname , email , password , username ].some((feild)=>
            feild?.trim() === "")
    ){
        throw new ApiError (400 ,"all feild are required" )
    }
    //check if there is any user also exist model(moongoose) with same username and email
    const existedUser = await User.findOne({
        //? $or is an operateor
        $or : [{username},{email}]
    })

    if(existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }
    console.log(req.files);
//in coverImagePath see if there is req.file agr h thn see is there any coverImage agr h then see uska first property agr h then get its path 
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
//const 
    const newUser =User.create({
        fullname,
        //use cloudinay url
        avatar:avatar.url,
        //agr optional toh left empty
        coverImage:coverImage?.url || " ",
        email,
        password,
        //convert it to lower case 
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

   


const loginUser = asynchandler(async(req, res )=>{
     //!here we start login page
    //!main algo
    //take mail ,username, pass
    //show error there is no username or email
    //find that in mongoose User if that user exist or not
    //then see if the user is vaild or not
    //generate access and refresh token(make a method of it)
    //send cookies


    const {email ,username, password} = req.body

    //check if there is any username or email
    if (!(username || email)) {
        throw new ApiError (400,"username or email is required")
    }

    //find user with their username or email
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

    //?The refresh token allows the user to obtain a new access token when the old one expires.
    //?the access token allows the user to access for short period of tym
    const {accessToken, refreshToken} =await 
    generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findOne(user._id).select
    ("-password -refreshToken")

    //?This object defines options for the cookies
    const option = {
        //ensures that the cookie is only accessible by the server
        httpOnly :true,
        //ensures that the cookie is only sent over HTTPS.
        secure : true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken)
    .cookie("refreshToken", refreshToken)
    .json(
        new ApiResponse(
            //send a json that includes status code the user ka loggedInUser, accessToken, refreshToken and a message
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
            //set refresh token undefined... basicaly delete
            $set:{
                refreshToken:undefined
            }
        },

        {//return the object after completing removing token
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
    //retrieve the refreshToken either from cookie or body
    const incomingRefreshToken = req.cookie.
    refreshToken || req.body.refreshToken

    if(incomingRefreshToken){
        throw new ApiError(401, "unauthorised request")
    }

    //Verifying the Refresh Token
    const decodedToken =jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    )
        //find user from decoded token ke andar ka id h
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
//Generating New Tokens
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

const changeCurrentPassword = asynchandler(async(req, res)=>{

    //!main algo
    //get oldpassword , newpassword from the person
    //find user by that person ka id
    //check his password
    //then change that person ka passwrd with new password and save
    //then send respnse
    const {oldPassword, newPassword} = req.body

    const user=await User.findById(req.user?._id)

    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400,"invalid password")
    }

    {
        
        user.password=newPassword
        //save changes without triggreing validation
        await user.save({validateBeforeSave:false})

        return res
        .status(200)
        .json(new ApiResponse(200,{},"password change successfuly"))
    }
})


const getCurrentUser= asynchandler(async(req, res)=>{
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfully"))
})


const updateAccountDetails = asynchandler(async(req, res)=>{
    //!main alogo
    //get fullname email for the person(user,body)
    //find by id and update set new fullname , email to the model(User) and remove password
    //then return response
    const {fullname, email}=req.body

    if(!fullname || !email){
        throw new ApiError(400, "all feild are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullname,
                email:email
            }
        },
        {new : true}
        //we are putting this in json user and we dont want to show it there that y we dont we dont want this shiii..
    ).select("-password")

return res
.status(200)
.json(new ApiResponse(200, user, "account details updated successfully"))
})

const updateUserAvatar = asynchandler(async(req, res)=>{

    //!main algo


    const avatarLocalPath=req.files?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar file is missing")
        
    }

    const avatar=uploadOnCloudnary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "error while uploading on avatar ")
    }

    const user = await User.findByIdAndUpdate(
        req.user?.id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {new : true}
    ).select("-password")
    return res
.status(200)
.json(new ApiResponse(200,user, "avatar image updated" ) )


})


const userCoverImage=asynchandler(async(req, res)=>{

    //!main algo
    //1. Extracting the Cover Image Path
    //2. Validation: Check for the Presence of Cover Image
    //3. Upload the Cover Image to Cloudinary
    //4. Check for Successful Upload
    //5. Update the User Document in the Database
    //



const coverImagePath=req.files?.path

if (!coverImagePath) {
    throw new ApiError(400, "avatar file is missing")
    
}

//upload coverImagePath in cloudnary assgine it to coverImage
const coverImage=uploadOnCloudnary(coverImagePath)

if (!coverImage.url) {
    throw new ApiError(400, "error while uploading on avatar ")
}

//find the user using its id and 
const user = await User.findByIdAndUpdate(
    req.user?.id,
    {
        //update cover image
        $set:{
            coverImage:coverImage.url
        }
    },
    {new : true}
).select("-password")

return res
.status(200)
.json(new ApiResponse(200,user, "cover image updated" ) )

})


const getUserChannelProfile = asynchandler(async(req, res)=>{

    //!mian algo



    //Extracting username from req.params
    const{username} =req.params

    if (!username) {
        throw new ApiError(400, "username is missing")
    }

    
    const channel = await User.aggregate([
        {
            $match:{
            username:username?.toLowerCase(),
        }},
        {
            $lookup:{
                //model mein sb lowercase and prural
                from :"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscription"
            }
        },
        {
            $lookup:{
                //model mein sb lowercase and prural
                from :"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscriptionTo"
            }
        },
        {
            $addFields:{
                subscriberCount:{
                    //dollar means feild
                    $size :"$subscribers"
                },
                channelsSubscribedToCount:{
                    $size:"subscriptionTo"
                },
                isSubscribed:{
                    $cond:{
                        if:{$in:[req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else:false

                    }
                },
            },
            
                
            
        },
        {
            $project:{
                fullname:1,
                username:1,
                subscriberCount:1,
                channelsSubscribedToCount:1,
                avatar:1,
                coverImage:1,
                email:1
            }

        }
    ])

    if (!channel?.length) {
        throw new ApiError(400, "channel does not exist")
    }
    
    return res
    .status(200)
    .json(
        new ApiResponse(200,channel[0],"user channel fetched")
    )
})


const getWatchHisory = asynchandler(async(req, res)=>{
    const user = await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.ObjectId)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:user,
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                               { $project:{
                                    fullname:1,
                                    username:1,
                                    avatar:1
                                },
                                
                            
                            }
                                
                            ],
                        }
                    },{
                        
                            $addFields:{
                                owner:{
                                    $first:"$owner"
                                }
                            
                        }
                    }
                ]
            }
        }
    ])
    return res
    .status(200)
    .json(new ApiResponse(200,user[0].watchhistory,"Watch history fetched successful"))
})











export {registerUser, 
    loginUser ,
    logoutUser,
    refreshAccessToken , 
    getCurrentUser, 
    changeCurrentPassword,
    updateAccountDetails,
    updateUserAvatar,
    getUserChannelProfile,
    userCoverImage,
    getWatchHisory
}