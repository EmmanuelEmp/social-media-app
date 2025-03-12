import mongoose, { trusted } from "mongoose";
import argon2 from "argon2";

export interface UserDocument extends mongoose.Document {
    username: string;  
    email: string;
    password: string;
    comparePassword(candidatePassword: string): Promise<boolean>;  // ✅ Add this
  }
  
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true},
},  {
    timestamps: true,
  });

userSchema.pre<UserDocument>("save", async function (next) {
    if (this.isModified("password")) {
        try {
            this.password = await argon2.hash(this.password);

        } catch (error: any) {
            return next(error);
        }
    }
});

userSchema.methods.comparePassword = async function (candidatePassword: string) {
    try {
        return await argon2.verify(this.password, candidatePassword);
    } catch (error) {
        throw error;
    }
}
userSchema.index({ username: "text" });

const User = mongoose.model<UserDocument>("User", userSchema);
export default User;