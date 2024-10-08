//this is where the routes are stored

import {  Router } from "express";
import {changeCurrentPassword, 
    getCurrentUser, 
    getUserChannelProfile, 
    getWatchHisory, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    registerUser, 
    updateAccountDetails, 
    updateUserAvatar, 
    userCoverImage} from "../controllers/user.controller.js";
import { uploadOnCloudnary } from "../utils/cloudnary.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router= Router();
console.log("Register route initialized"); // Log when the route is initialized

// router.route("/register").post(registerUser)
//app.js se yaha gya req phir yaha registerUser method call ho gya
router.route("/register").post(
    //use upload method to upload 2 feilds in the form of array
    upload.fields([
        {
            name : "coverImage",
            maxCount :1
        },
        {
            name:"avatar",
            maxCount:1
        }
    ]),registerUser
)
router.route("/login" ).post(loginUser)

router.route("/logout", logoutUser)

//secured routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/current-user").get(verifyJWT,getCurrentUser)
//patch is used to upload only one 1 file
router.route("/update-account").patch(verifyJWT,updateAccountDetails)
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
router.route("/coverImage").patch(verifyJWT,upload.single("coverImage"),userCoverImage)
//when we are using params we have to use the orginal name
router.route("/c/:username").get(verifyJWT,getUserChannelProfile)
router.route("/history").get(verifyJWT,getWatchHisory)



export default router ;