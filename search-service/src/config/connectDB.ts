import mongoose from 'mongoose';
import dotenv from "dotenv";
import { logger } from '../utils/logger';
dotenv.config();

export const connectDB = async () => {
    try {
        logger.info(`MONGO URI: ${process.env.MONGO_URI}`)
        const conn = await mongoose.connect(process.env.MONGO_URI as string, {
        });
        logger.info(`DB Connected: ${mongoose.connection.host}`);
        
    } catch (error) {
        logger.error('Error connecting to DB: ', error);
        process.exit(1);
    }
}


