import { config } from "dotenv";
import { Express } from "express";
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

//json mein data import kr skte with a limit of 16kb
app.use(Express.json({limit:'16kb'}))
//extended url by encoding 
app.use(Express.urlencoded({extended:true, limit:'16kb'}))
//access 
app.use(Express.static("public"))

app.use(cookieparser)


export {app}