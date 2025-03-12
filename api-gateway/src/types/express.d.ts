import { Redis } from "ioredis";
import { Request } from "express";

declare module "express-serve-static-core" {
     interface Request {    
         user?: { userId: string }; // Add user property to Request
         redisClient?: Redis; // Add redisClient property to Request
      }
    
}
