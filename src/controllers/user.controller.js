import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/Apierror.js"; 
import { User } from "../models/user.model.js";
import {uploadOnCloudnary} from "../utils/cloudnary.js"
import {ApiResponse} from "../utils/ApiResponse.js"



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




export  {registerUser}