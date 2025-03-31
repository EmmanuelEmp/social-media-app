import Search from "../models/searchModel";
import { Request, Response } from "express";
import { logger } from "../utils/logger";



// implement caching here for 2 to 5 mins

// @desc    Create a new search post
export const searchPost = async (req: Request, res: Response): Promise<void> => {
    logger.info("Creating a new search post endpoint hit...");
    try {
        const query = typeof req.query.query === "string" ? req.query.query : "";

        if (!query) {
            res.status(400).json({
                success: false,
                message: "Query parameter is required and must be a string",
            });
            return;
        }

        const results = await Search.find({
            $text: { $search: query },
        },
        {
            score: { $meta: "textScore" },
        }).sort({ score: { $meta: "textScore" } })
        .limit(10);

        res.json({
            success: true,
            message: "Search results",
            data: results,
        });

    
    } catch (error) {
        logger.error("Error creating search post", error);
        res.status(500).json({
        success: false,
        message: "Internal server error, while searching post",
        });
    }
    }