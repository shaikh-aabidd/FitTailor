import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async(localFilePath)=>{
    try {
        if(!localFilePath) return null;
        //upload the file on cloudinary
        const resoponse = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        //response returns an array

        //file uploaded successfully
        fs.unlinkSync(localFilePath);
        console.log("File is uplaoded on cloudinary successfully ",resoponse.url)
        return resoponse;
    } catch (error) {
        fs.unlinkSync(localFilePath); //remove locally stored file on the server
        console.log("Error while uploading file on cloudinary")
        return null;
    }
}

const deleteFromCloudinary = async (fileUrl) => {
    if (!fileUrl) return null;
  
    try {
      const url = new URL(fileUrl);
      const path = url.pathname.split('/').slice(2).join('/');  
      const publicId = path.replace(/\.[^/.]+$/, '');        
  
      // **Await** the destroy call
      const result = await cloudinary.uploader.destroy(publicId);
      console.log('Cloudinary Delete Response:', result);
      return result;
    } catch (error) {
      console.error('Error deleting file from Cloudinary:', error);
      return null;
    }
  };

export {
    uploadOnCloudinary,
    deleteFromCloudinary
};