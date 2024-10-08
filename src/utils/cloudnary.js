import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

//!main algo
//Cloudinary Configuration:
//uploadOnCloudnary function takes the path to a local file (localFilePath), uploads it to Cloudinary, and deletes the local file afterward.
//Return the Cloudinary Response:


    cloudinary.config({ 
        cloud_name: process.env.CLOUDNARY_CLOUD_NAME, 
        api_key: process.env.CLOUDNARY_API_KEY, 
        api_secret: process.env.CLOUDNARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });


    const uploadOnCloudnary = async (localFilePath) => {
        try {
            if(!localFilePath) return null 
            //upload file in cloudnary 
            const response = await cloudinary.uploader.upload(localFilePath,{
                resource_type :"auto"
            })
            //file upload ho gya
            // console.log("ho gya upload",response.url);
            fs.unlinkSync(localFilePath)
            return response;
        } catch (error) {
            //khuda na khasta age fail hua toh corrupted file ko nikalo
            fs.promises.unlinkSync(localFilePath)
            return null;
        }
    }

    export {uploadOnCloudnary}