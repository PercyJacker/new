import  dotenv  from "dotenv";
import  Express  from "express";
import cookieparser from 'cookie-parser'
import cors from 'cors'

const app=Express()


dotenv.config({
    path :"./env"
   
})


app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials: true
}))
console.log("CORS middleware set up"); // Confirm middleware is being applied


//json mein data import kr skte with a limit of 16kb
app.use(Express.json({limit:'16kb'}))
//extended url by encoding 
app.use(Express.urlencoded({extended:true, limit:'16kb'}))
//access 
app.use(Express.static("public"))
app.use(cookieparser())
console.log("Middleware for parsing, static files, and cookies set up"); // Log that all middlewares are set


//routes import ho rhi
import userRouter from "./routes/user.route.js"



//route declaration
//koi bhi user /user mein ayega woh req userRouter mein chla jayga
app.use("/api/v1/user",userRouter)
console.log("User routes set up at /api/v1/user"); // ?Confirm the route is being registered


//http://localhost:8000/api/v1/users/register


export {app};