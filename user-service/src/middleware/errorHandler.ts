
import { Express, Response, Request, NextFunction} from "express"
import { logger } from "../utils/logger";

interface CustomError extends Error {
    status?: number;
}
export const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || "Something went wrong",
    });
};