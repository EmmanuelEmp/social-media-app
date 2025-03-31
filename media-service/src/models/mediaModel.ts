import { url } from 'inspector';
import mongoose from 'mongoose';

interface MediaModel extends mongoose.Document {
    publicId: string;
    name: string;
    url: string;
    type: string;
    }

const mediaSchema = new mongoose.Schema({
  publicId: { type: String, required: true },
  originalname: { type: String, required: true },
  mimetype: { type: String, required: true },
  url: { type: String, required: true },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
}, { timestamps: true });

const Media = mongoose.model<MediaModel>('Media', mediaSchema);
export default Media;