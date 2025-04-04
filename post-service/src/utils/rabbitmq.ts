import amqp from 'amqplib';
import { logger } from './logger';

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost:5672";

// Initialize connection and channel
let connection = null;
let channel: amqp.Channel | null = null;

// Define exchange name
const EXCHANGE_NAME = 'facebook-events';

// Connect to RabbitMQ
export async function connectRabbitMQ() {
    try {
        connection = await amqp.connect(RABBITMQ_URL as string);
        channel = await connection.createChannel();
        await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: false });
        logger.info('Connected to rabbit mq');
        return channel;
    } catch (error) {
        logger.error('Error connecting to rabbit mq', error);
    }
}

// Publish event to RabbitMQ
export async function publishEvent(routingKey: string, message: Record<string, any>) {
    try {
        if (!channel) {
            await connectRabbitMQ();
        }
        if (channel) {
            channel.publish(EXCHANGE_NAME, routingKey, Buffer.from(JSON.stringify(message)));
        } else {
            throw new Error('Channel is not initialized');
        }
        logger.info(`Event published: ${routingKey}`);
    } catch (error) {
        logger.error('Error publishing event', error);
    }
}