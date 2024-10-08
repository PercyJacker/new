//here connect db to the port

import dotenv from 'dotenv'
import mongoose, { connect } from "mongoose";
import connectDB from './db/index.js';
import {app} from "./app.js"

dotenv.config(); 


connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000,()=>{console.log(`server is running PORT ${process.env.PORT}`)})
}).catch((err) => {
    console.log("connectDB failed",err);
    
});




connect

//!this is basic apporach to connect dusra wla index.js mein h
// (async()=>{
//     try {
//         await mongoose.connect(`${process.env.Mongo_URI}/${DB_name}`)
//         app.on('error',(error)=>{
//             console.log("error : ",error);
//             throw error
//         })

//         app.listen(process.env.PORT,()=>{
//             console.log(`app is listning on port ${process.env.PORT}`);
//         })
//     } catch (error) {
//         console.error("ERROR" , error);
//         throw error
//     }
// })()