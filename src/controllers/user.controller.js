import { asynchandler } from "../utils/asynchandler.js";

const registerUser = asynchandler(async (req, res )=>{
    console.log("registerUser route hit"); // This will confirm the function is being called
    console.log("Request body: ", req.body); // Log the request body to check data received

    return res.status(200).json({

        message : "chai and percy"
    })
})

export  {registerUser}