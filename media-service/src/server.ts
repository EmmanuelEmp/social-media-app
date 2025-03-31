import express from "express";
import { logger } from "./utils/logger";
import { connectDB } from "./config/connectDB";
import helmet from "helmet";
import cors from "cors";
import Redis from "ioredis";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/errorHandler";
import mediaRoutes from './routes/mediaRoutes'
import { connectRabbitMQ, consumeEvent } from "./config/rabbitmq";
import { handlePostDeleted, PostDeletedEvent } from "./eventHandler/mediaEventHandlers";
dotenv.config()

const app = express();
connectDB()

const PORT = process.env.PORT || 3003;

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

app.use('/api/media', mediaRoutes)

app.use(errorHandler)

async function startServer() {
    try {
        await connectRabbitMQ();

        // consume all the events
        await consumeEvent('post.deleted', (message: Record<string, any>) => {
            const event: PostDeletedEvent = {
                postId: message.postId,
                userId: message.userId,
                mediaIds: message.mediaIds,
                deletedAt: message.deletedAt,
            };
            handlePostDeleted(event);
        });

        app.listen(PORT, () => {
            logger.info(`This is a media service running on port ${PORT}`);
        });
        
    } catch (error) {
        logger.error(`Error starting server: ${error}`);
        process.exit(1);
    }
}

startServer();

//unhandled promise rejection
process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled promise rejection", promise, 'reason', reason);
    process.exit(1);
});