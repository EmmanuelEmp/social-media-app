import mongoose from "mongoose";
import { title } from "process";

interface searchPostModel extends mongoose.Document {
    postId: string;
    userId: string;
    content: string;
    title: string;
    createdAt: Date;
    _id: mongoose.Types.ObjectId;
}

const searchPostSchema = new mongoose.Schema({
    postId: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: Array,
        required: true,
        index: true
    },
    content: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true
    }
}, { timestamps: true });

searchPostSchema.index({ content: 'text' });
searchPostSchema.index({ title: 'text' });
searchPostSchema.index({ createdAt: -1 });


const Search = mongoose.model<searchPostModel>('Search', searchPostSchema);
export default Search;