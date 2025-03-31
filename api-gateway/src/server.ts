import express from 'express'
import Redis from "ioredis";
import dotenv from "dotenv";
import helmet from 'helmet'
import cors from 'cors'
import { rateLimit } from "express-rate-limit";
import { RedisReply, RedisStore } from "rate-limit-redis"
import { logger } from './utils/logger'
import proxy from 'express-http-proxy'
import { errorHandler } from './middleware/errorHandler';
import { validateToken } from './middleware/authMiddleware';
dotenv.config()


const app = express()
const PORT  = process.env.PORT || 3000;

const redisClient = new Redis(process.env.REDIS_URL as string);

app.use(helmet());
app.use(cors());
app.use(express.json()); 

//rate limiting middleware
const rateLimitOptions = rateLimit({
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
app.use(rateLimitOptions);

app.use((req, res, next) => {
    logger.info(`Recieved ${req.method}  request to ${req.url}`);
    logger.info(`Request body: ${JSON.stringify(req.body)}`);
    next();
});

const proxyOptions = {
    proxyReqPathResolver: (req: { originalUrl: string; }) => {
        return req.originalUrl.replace(/^\/v1/, '/api');
    },
    proxyErrorHandler: (err: any, res: any) => {
        logger.error(`Proxy error: ${err.message}`);
        res.status(500).send({success: false, message: 'Proxy error', error: err.message});
 }
}
// setting up proxy for user services

app.use('/v1/auth', proxy( process.env.USER_SERVICE_URL as string, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
       proxyReqOpts.headers = proxyReqOpts.headers || {};
       proxyReqOpts.headers["Content-Type"] = "application/json";
         return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info(`Response from user service: ${proxyRes.statusCode}`);
        return proxyResData;
    }
})
)

// setting up proxy for post services
app.use('/v1/posts', validateToken, proxy( process.env.POST_SERVICE_URL as string, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
       proxyReqOpts.headers = proxyReqOpts.headers || {};
       proxyReqOpts.headers["Content-Type"] = "application/json";
       if (srcReq.user) {
           proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
       }
       return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info(`Response from post service: ${proxyRes.statusCode}`);
        return proxyResData;
    }
})
)

// setting up proxy for search services
app.use('/v1/search', validateToken, proxy( process.env.SEARCH_SERVICE_URL as string, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
       proxyReqOpts.headers = proxyReqOpts.headers || {};
       proxyReqOpts.headers["Content-Type"] = "application/json";
       if (srcReq.user) {
           proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
       }
       return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info(`Response from search service: ${proxyRes.statusCode}`);
        return proxyResData;
    }
})
)

// setting up proxy for media services
app.use('/v1/media', validateToken, proxy(process.env.MEDIA_SERVICE_URL as string, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers = proxyReqOpts.headers || {};
        if (srcReq.user) {
            proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
        }
        if(!srcReq.headers['content-type']?.startsWith('multipart/form-data')){
            proxyReqOpts.headers["Content-Type"] = "application/json";
        }
        return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info(`Response from media service: ${proxyRes.statusCode}`);
        return proxyResData;
    },
    parseReqBody: false
}))

app.use(errorHandler);

app.listen(PORT, () => {
    logger.info(`API Gateway is running on port ${PORT}`);
    logger.info(`User service is running on ${process.env.USER_SERVICE_URL}`);
    logger.info(`Post service is running on ${process.env.POST_SERVICE_URL}`);
    logger.info(`Media service is running on ${process.env.MEDIA_SERVICE_URL}`);
    logger.info(`Search service is running on ${process.env.SEARCH_SERVICE_URL}`);
    logger.info(`Redis request is running on ${process.env.REDIS_URL}`);

}
)