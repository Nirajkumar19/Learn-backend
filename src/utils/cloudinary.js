import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration of cloudinary.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// For uploading the files we can simply follow or write the code which is given by the cloudinary documentation that is:-
/*cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
  { public_id: "olympic_flag" }, 
  function(error, result) {console.log(result); });*/

// But we are doing here is take the local path of the file and then upload that on the cloudinary and also once we upload the file we unlink the file(Delete the file)

const uploadonCLoudinary = async (localpath) => {
    try {
        // We gave the condition for existance of localpath.
        if(localpath){
            const response = await cloudinary.uploader.upload(localpath,{resource_type: "auto"}) // Resource type means which type of file we are going to upload like png,pdf,raw etc.. So we are giving auto, it means detect it by yourself.
            fs.unlinkSync(localpath);
            return response; // In response so many features are there like URL, and many more.
        }else return null;
    } catch (error) {
        fs.unlinkSync(localpath); //This will remove or unlink the file from local storage because we are not able to upload the file.
    }
}

export {uploadonCLoudinary}