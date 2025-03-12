import { logger } from "../utils/logger";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const validateToken = async (req: Request, res: Response, next: NextFunction): Promise<void>  => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        logger.warn('Unauthorized: No token provided');
        res.status(401).send({
            success: false,
            message: 'Unauthorized'
        });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; username: string; email: string };
        req.user = { userId: decoded.id }; // Map id to userId
        next();
    } catch (error) {
        if (error instanceof Error) {
            logger.error(`Unauthorized: ${error.message}`);
        } else {
            logger.error('Unauthorized: An unknown error occurred');
        }
        res.status(401).send({ success: false, message: 'Invalid token' });
        return;
    }
};

export { validateToken };
