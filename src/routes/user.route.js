import {  Router } from "express";
import {registerUser} from "../controllers/user.controller.js";
import { uploadOnCloudnary } from "../utils/cloudnary.js";
import { upload } from "../middleware/multer.middleware.js";

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


export default router ;