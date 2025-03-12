import mongoose from 'mongoose';
 
interface PostModel extends mongoose.Document {
    user: string;
    title: string;
    content: string;
    mediaUrls: string[];
    createdAt: Date;
}

const postSchema = new mongoose.Schema({
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    mediaIds : [
        {
        type: String,
    }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true});

// because we will have different service for search, we will create a text index on content field
postSchema.index({ content: 'text' });

const Post = mongoose.model<PostModel>('Post', postSchema);
export default Post