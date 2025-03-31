import { logger } from "../utils/logger";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const validateToken = async (req: Request, res: Response, next: NextFunction): Promise<void>  => {
    let token: string | undefined;

    // 1. Check Authorization header
    const authHeader = req.headers['authorization'];
    if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }

    // 2. If no token in header, check cookies
    if (!token && req.cookies?.token) {
        token = req.cookies.token;
    }

    if (!token) {
        logger.warn('Unauthorized: No token provided');
        res.status(401).json({
            success: false,
            message: 'Unauthorized: No token found'
        });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; username: string; email: string };
        req.user = { userId: decoded.id }; // Map id to userId
        next();
    } catch (error) {
        logger.error(`Unauthorized: Invalid token - ${error}`);
        res.status(401).json({ success: false, message: 'Invalid token' });
        return;
    }
};

export { validateToken };
