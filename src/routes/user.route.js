import {  Router } from "express";
import {registerUser} from "../controllers/user.controller.js";


const router= Router();
console.log("Register route initialized"); // Log when the route is initialized


//app.js se yaha gya req phir yaha registerUser method call ho gya
router.route("/register").post((req, res, next )=>{console.log("POST /register route hit");
next()},
registerUser)


export default router ;