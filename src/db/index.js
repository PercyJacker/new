import { mongoose } from "mongoose";
import { DB_name } from "../constants.js";

const connectDB= async()=>{
    try {
        //DB_name is a name of the database 
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_name}`)
        console.log(`\n mongo db is connected DB host ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("mongodb connection error ",error);
        process.exit(1)
    }
}


export default connectDB