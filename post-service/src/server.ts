import express from "express";
import { logger } from "./utils/logger";
import { connectDB } from "./config/connectDB";
import helmet from "helmet";
import cors from "cors";
import Redis from "ioredis";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/errorHandler";
import postRoutes  from "./routes/postRoutes";
import { rateLimit } from "express-rate-limit";
import { RedisReply, RedisStore } from "rate-limit-redis"
// import "./types/express"; // Import the custom types

dotenv.config();
connectDB();

const app = express();

const PORT = process.env.PORT || 3002;

const redisClient = new Redis(process.env.REDIS_URL as string);

//middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    logger.info(`Recieved ${req.method}  request to ${req.url}`);
    logger.info(`Request body: ${JSON.stringify(req.body)}`);
    next();
});

//***** - Implement Ip based rate limiting sensitive endpoints */


// const sensitiveRoutesLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 50,
//     standardHeaders: true,
//     legacyHeaders: false,
//     handler: (req, res) => {
//         logger.warn(`Too many requests from the same IP: ${req.ip}`);
//         res.status(429).send({success: false, message: "Too Many Requests"});
//         },
//         store: new RedisStore({
//             sendCommand: (command: string, ...args: (string | number | Buffer)[]) => redisClient.call(command, ...args) as Promise<any>,
//     }),

// }); 

//routes -> pass redisclient to routes
app.use('/api/posts', (req, res, next) => {
    req.redisClient = redisClient;
    next();
}, postRoutes )


app.use(errorHandler);


app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});

//unhandled promise rejection
process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled promise rejection", promise, 'reason', reason);
    process.exit(1);
});