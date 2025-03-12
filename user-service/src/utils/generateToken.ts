import { sign, JwtPayload } from "jsonwebtoken";
import crypto from "crypto";
import RefreshToken from "../models/refreshTokenModel";

export const generateToken = async (user: any) => {
  if (!user || !user._id) {
    throw new Error("Invalid user data for token generation");
  }

  const payload: JwtPayload = {
    id: user._id.toString(), // Ensure _id is a string
    username: user.username,
    email: user.email,
  };

  const token = sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "1h",
  });

  const refreshToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // expires in 7 days

  await RefreshToken.create({
    token: refreshToken,
    user: user._id.toString(), // Ensure _id is a string
    expiresAt,
  });

  return { token, refreshToken };
};
