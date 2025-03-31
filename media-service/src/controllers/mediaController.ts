import { logger } from "../utils/logger";
import { uploadMediaToCloudinary } from '../config/cloudinary';
 import { Request, Response } from 'express';
import Media from "../models/mediaModel";

const uploadMedia = async (req: Request, res: Response) => {
    logger.info("Uploading media");
    try {
        if (!req.file) {
            throw new Error("No file uploaded");
        }
        const { originalname, mimetype, buffer } = req.file;
        const userId = req.user?.userId;

        logger.info(`File details: originalname: ${originalname}, Type: ${mimetype}, userId: ${userId}`);
        logger.info("Uploading media to cloudinary");
        const cloudinaryResult = await uploadMediaToCloudinary(req.file);
        logger.info(`Media uploaded to cloudinary successfully, public Id: ${cloudinaryResult.public_id}`);
        
        const newlyCreatedMedia = new Media({
            publicId: cloudinaryResult.public_id,
            originalname,
            mimetype,
            url: cloudinaryResult.secure_url,
            userId
        });
        await newlyCreatedMedia.save()
        res.status(201).json({
            success: true,
            mediaId: newlyCreatedMedia._id,
            url: newlyCreatedMedia.url,
            message: 'Media uploaded successfully'
        })
    
    } catch (error) {
        logger.error(`Error uploading media: ${error}`);
        res.status(500).json({ success: false, message: "Error uploading media" });
    }
}
const getAllMedias = async (req: Request, res: Response) => {
    logger.info("Getting all media");
    try {
        const media = await Media.find({});
        res.status(200).json({ success: true, media });
    } catch (error) {
        logger.error(`Error getting media: ${error}`);
        res.status(500).json({ success: false, message: "Error getting media" });
    }
}
export{ uploadMedia, getAllMedias };