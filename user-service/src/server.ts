import express from "express";
import { logger } from "./utils/logger";
import { connectDB } from "./config/connectDB";
import helmet from "helmet";
import cors from "cors";
import { RateLimiterRedis } from "rate-limiter-flexible";
import Redis from "ioredis";
import userRoutes from "./routes/userRoutes";
import dotenv from "dotenv";
import { rateLimit } from "express-rate-limit";
import { RedisReply, RedisStore } from "rate-limit-redis"
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();
connectDB();

const app = express();

// if (!process.env.REDIS_URL) {
//     throw new Error("REDIS_URL is not defined in the environment variables");
// }
const redisClient = new Redis(process.env.REDIS_URL as string);

app.use(helmet());
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

app.use((req, res, next) => {
    logger.info(`Recieved ${req.method}  request to ${req.url}`);
    logger.info(`Request body: ${JSON.stringify(req.body)}`);
    next();
});

// DDOS protection middleware using rate-limiter-flexible. direct all requests to /api to this middleware

const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: "middleware",
    points: 10, // 10 requests
    duration: 1, // per 1 second by IP
});

 
app.use((req, res, next) => {
    if (req.ip) {
        rateLimiter
        .consume(req.ip)
        .then(() => { next()})
        .catch(() => {
            logger.warn(`Too many requests from the same IP: ${req.ip}`);
            res.status(429).send({success: false, message: "Too Many Requests"});
        });
    } else {
        next();
    }
})
 
//Ip rate limiting middleware for sensitive routes like login and register

const sensitiveRoutesLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Too many requests from the same IP: ${req.ip}`);
        res.status(429).send({success: false, message: "Too Many Requests"});
        },
        store: new RedisStore({
            sendCommand: (command: string, ...args: (string | number | Buffer)[]) => redisClient.call(command, ...args) as Promise<RedisReply>,
    }),

}); 

//apply to sensitive routes
app.use("/api/auth/register", sensitiveRoutesLimiter);

//routes
app.use("/api/auth", userRoutes);

//error handling middleware
app.use(errorHandler)

app.listen(PORT, () => {
    logger.info(`User service running on port ${PORT}`);
})
//unhandled promise rejection
process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled promise rejection", promise, 'reason', reason);
    process.exit(1);
});