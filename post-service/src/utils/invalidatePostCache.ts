
import { Request  } from "express";

export const invalidatePostCache = async (req: Request, input: any): Promise<void> => {
    const cacheKey = `posts:${input}`;
    await req.redisClient?.del(cacheKey);
    const keys = await req.redisClient?.keys("posts:*");
    if (keys) {
        keys.forEach(async (key) => {
            await req.redisClient?.del(key);
        });
    }
} 


