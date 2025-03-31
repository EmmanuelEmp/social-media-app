import Search from "../models/searchModel";
import { logger } from "../utils/logger";

// handlePostCreated function
export async function handlePostCreated(event: any) {
    try {
        // Handle post created event
        // logger.info("Handling post created event...");
        const newSearchPost = new Search({
            postId: event.postId,
            userId : event.userId,
            title : event.title,
            content : event.content,
            createdAt : event.createdAt
        });
        await newSearchPost.save();
        logger.info(`Search post created successfully: ${event.postId}, ${newSearchPost._id.toString()}`);
    } catch (error) {
        logger.error(`Error handling post created event: ${error}`);
    }
}
// handlePostDeleted function
export async function handlePostDeleted(event: any) {
    try {
        // Find the document using postId
        const searchPost = await Search.findOne({ postId: event.postId });

        if (!searchPost) {
            logger.warn(`No search post found with postId: ${event.postId}`);
            return;
        }

        // Use findByIdAndDelete with the actual ObjectId (_id)
        await Search.findByIdAndDelete(searchPost._id);

        logger.info(`Search post deleted successfully: ${event.postId}`);
    } catch (error) {
        logger.error(`Error handling post deleted event: ${error}`);
    }
}
