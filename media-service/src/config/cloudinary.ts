import { v2 as cloudinary } from 'cloudinary';
import { logger } from '../utils/logger';

import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

const uploadMediaToCloudinary = async (file: any): Promise<{ public_id: string, secure_url: string }> => { 
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream( {
        resource_type: 'auto',
      }, (error, result) => {
        if (result) {
          resolve(result);
        } else {
          logger.error(`Error uploading file to cloudinary: ${error}`);
          reject(error);
        } 
      })
      uploadStream.end(file.buffer);
    }
    )
    // const result = await cloudinary.uploader.upload(file.path);
    // return result.secure_url;
  } catch (error) {
    logger.error(`Error uploading file to cloudinary: ${error}`);
    throw new Error("Error uploading file to cloudinary");
  }
}
const deleteMediaFromCloudinary = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    logger.info(`File deleted from cloudinary`, publicId);
    return result;
  } catch (error) {
    logger.error(`Error deleting file from cloudinary: ${error}`);
    throw new Error("Error deleting file from cloudinary");
  }
}
export{ uploadMediaToCloudinary, deleteMediaFromCloudinary };
