import { deleteMediaFromCloudinary } from "../config/cloudinary";
import Media from "../models/mediaModel";
import { logger } from "../utils/logger";


export interface PostDeletedEvent {
    postId: string;
    userId: string;
    mediaIds: string[];
    deletedAt: Date;
}

export const handlePostDeleted = async (event: PostDeletedEvent) => {
    console.log(event, 'event');

    const { postId, mediaIds, deletedAt } = event;
    try {
        const mediaToDelete = await Media.find({_id:  {$in: mediaIds} })
        for (const media of mediaToDelete) {
            await deleteMediaFromCloudinary(media.toObject().publicId);
            await Media.findByIdAndDelete(media._id);
            logger.info(`Deleted media: ${media._id} associated with post: ${postId}`);
        }
        logger.info(`Post: ${postId} deleted at ${deletedAt}`);
    } catch (error) {
        logger.error('Error handling post deleted event', error);}
}