import express, { Request, Response, NextFunction} from 'express'
import multer from 'multer';

import { uploadMedia, getAllMedias } from '../controllers/mediaController';
import { authUser } from '../middleware/authMiddleware';
import { logger } from '../utils/logger';

const router = express.Router()

//configure multer for file upload
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    }
}).single('file')

router.post('/upload', authUser, (req: Request, res: Response, next: NextFunction) => {
    upload(req, res, function(err){
        if(err instanceof multer.MulterError){
            logger.error('Multer error while uploading:', err)
            res.status(400).json({
                message: 'Multer error while uploading',
                error: err.message,
                stack: err.stack 
            })
            return
        } else if(err){
            logger.error('Unknown error occured while uploading:', err)
            res.status(500).json({
                message: 'Unknown error occured while uploading',
                error: err.message,
                stack: err.stack 
            })
            return;
        } 
        if(!req.file){
            res.status(400).json({
                message: 'No file found!',
            })
        }
        next()
    })

}, uploadMedia)

router.get('/all-medias', authUser, getAllMedias)

export default router;