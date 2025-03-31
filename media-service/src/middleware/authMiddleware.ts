import { logger } from "../utils/logger";
import { Request, Response, NextFunction } from "express";
// import "../types/express"; // Import the extended Request interface

const authUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.headers["x-user-id"] as string | string[];

    if (!userId) {
        logger.warn("User ID not found");
        res.status(401).json({
            success: false,
            message: "Unauthorized to access this resource",
        });
        return;
    }

    req.user = { userId: Array.isArray(userId) ? userId[0] : userId }; // Ensure it's a string

    next();
};
 
export { authUser };

