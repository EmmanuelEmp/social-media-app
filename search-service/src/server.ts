import dotenv from 'dotenv';
import express from "express";
import { logger } from "./utils/logger";
import { connectDB } from "./config/connectDB";
import helmet from "helmet";
import cors from "cors";
import Redis from "ioredis";
import { rateLimit } from "express-rate-limit";
import { searchPost } from './controllers/searchController';
import { connectRabbitMQ, consumeEvent } from './config/rabbitmq';
import { errorHandler } from "./middleware/errorHandler";
import { handlePostCreated, handlePostDeleted } from './eventHandler/searchEventHandler';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;


app.use(helmet());
app.use(cors());
app.use(express.json());


app.use((req, res, next) => {
    logger.info(`Recieved ${req.method}  request to ${req.url}`);
    logger.info(`Request body: ${JSON.stringify(req.body)}`);
    next();
});

// Home work - implement rate limiting for sensitive endpoints - pass redis client as part of your req and then implement redis caching

//Home work implement redis caching

app.use( '/api/search', searchPost)

app.use(errorHandler);


async function startServer() {
    try {
        await connectDB();
        await connectRabbitMQ();

        // consume event /subscribe to event
        consumeEvent('post.created', handlePostCreated);
        consumeEvent('post.deleted', handlePostDeleted);
        app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
        });
    } catch (error) {
        logger.error(`Error starting server: ${error}`);
    }
}
    
startServer();