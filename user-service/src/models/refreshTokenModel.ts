import { ref } from "joi";
import mongoose from "mongoose";

export interface RefreshTokenDocument extends mongoose.Document {
    token: string;
    user: string;
    expiresAt: Date;
}

const refreshTokenSchema = new mongoose.Schema({
    token: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expiresAt: { type: Date, required: true }
    } , { timestamps: true });


    refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RefreshToken = mongoose.model<RefreshTokenDocument>("RefreshToken", refreshTokenSchema);
export default RefreshToken;