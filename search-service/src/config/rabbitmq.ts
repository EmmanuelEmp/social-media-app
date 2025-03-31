import amqp from 'amqplib';
import { logger } from '../utils/logger';

// Initialize connection and channel
let connection = null;
let channel: amqp.Channel | null = null;

// Define exchange name
const EXCHANGE_NAME = 'facebook-events';

// Connect to RabbitMQ
export async function connectRabbitMQ() {
    try {
        connection = await amqp.connect(process.env.RABBITMQ_URL as string);
        channel = await connection.createChannel();
        await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: false });
        logger.info('Connected to rabbit mq');
        return channel;
    } catch (error) {
        logger.error('Error connecting to rabbit mq', error);
    }
}
// consume event
export async function consumeEvent(routingKey: string, callback: (message: Record<string, any>) => void) {
    try {
        if (!channel) {
            await connectRabbitMQ();
        }
        if (channel) {
            const queue = await channel.assertQueue('', { exclusive: true });
            channel.bindQueue(queue.queue, EXCHANGE_NAME, routingKey);
            channel.consume(queue.queue, (message) => {
                if (message) {
                    callback(JSON.parse(message.content.toString()));
                    if (channel) {
                        channel.ack(message);
                    } else {
                        throw new Error('Channel is not initialized');
                    }
                }
            });
            logger.info(`Subscribed to event: ${routingKey}`);
        } else {``
            throw new Error('Channel is not initialized');
        }
    } catch (error) {
        logger.error('Error consuming event', error);
    }
}