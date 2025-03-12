import { logger } from "../utils/logger";
import { validateLoginInput, validateRegisterInput } from "../utils/validation";
import User from "../models/userModel";
import { Request, Response } from "express";
import { generateToken } from "../utils/generateToken";
import RefreshToken from "../models/refreshTokenModel";

export const registerUser = async (req: Request, res: Response): Promise<void> => {
    logger.info("Registering a new user endpoint...");
    try {
        // Validate user input
        const { error } = validateRegisterInput(req.body.username?.trim(), req.body.email?.trim().toLowerCase(), req.body.password);
        if (error) {
            logger.warn("Validation error details", JSON.stringify(error.details, null, 2));
            res.status(400).json({ 
                success: false, 
                message: error.details[0].message 
            });
        } 

        const { username, email, password } = req.body;

        // Check if user already exists
        let user = await User.findOne({ 
            $or: [
                { email: email.toLowerCase() }, 
                { username } 
            ] 
        });

        if (user) {
            logger.warn("User already exists");
         res.status(400).json({ 
                success: false, 
                message: "User already exists" 
            });
        }

        // Create new user
        user = new User({ username, email: email.toLowerCase(), password });
        await user.save();
        logger.info("User created successfully", user._id);

        const { token, refreshToken } = await generateToken(user);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            refreshToken
        });
    } catch (error) {
        logger.error("Error registering user", error);
       res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

//user login

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    logger.info("login endpoint...");
    try {
    // validate the schema
    const {error} = validateLoginInput(req.body.email?.trim().toLowerCase(), req.body.password);
    if (error) {
        logger.warn("Validation error details", JSON.stringify(error.details, null, 2));
        res.status(400).json({ 
            success: false, 
            message: error.details[0].message 
        });
    } 

    const { email, password } = req.body;
    const user = await User.findOne({ email })
    if(!user){
        logger.warn('Invalid details')
        res.status(400).json({
            success: false,
            message: 'Invalid user'
        })
        return;
    }
    const isMatch = await user.comparePassword(password);
        if(!isMatch) {
            logger.warn("Invalid password");
            res.status(400).json({ 
                success: false, 
                message: "Invalid password" 
            });
        }
        const {token, refreshToken} = await generateToken(user)
        res.json({
            token,
            refreshToken,
            userId: user._id
        })
    } catch (error) {
        logger.error("Error login user", error);
       res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// refresh token

export const userRefreshToken = async (req: Request, res: Response) => {
    logger.info("Refresh token endpoint...");
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            logger.warn("No refresh token provided");
            res.status(400).json({ 
                success: false, 
                message: "No refresh token provided" 
            });
            return;
        }
        const storedToken = await RefreshToken.findOne({ token: refreshToken });
        if (!storedToken || storedToken.expiresAt < new Date()) { 
            logger.warn("Invalid refresh token");
            res.status(400).json({ 
                success: false, 
                message: "Invalid refresh token" 
            });
            return;
        }
        const user = await User.findById(storedToken.user);
        if (!user) {
            logger.warn("User not found");
            res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
            return;
        }
        const { token: newToken, refreshToken: newRefreshToken } = await generateToken(user);
        // Delete old refresh token
        await RefreshToken.deleteOne({_id: storedToken._id})
        res.status(200).json({
            success: true,
            message: "Token refreshed successfully",
            token: newToken,
            refreshToken: newRefreshToken
        });
        return;
    } catch (error) {
        logger.error("Error refreshing token", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
        return;
    }
}

//logout
export const logoutUser = async (req: Request, res: Response) => {
    logger.info("Logout user endpoint...");
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            logger.warn("No refresh token provided");
            res.status(400).json({ 
                success: false, 
                message: "No refresh token provided" 
            });
            return;
        }
        const storedToken = await RefreshToken.findOne({ token: refreshToken });
        if (!storedToken) {
            logger.warn("Invalid refresh token");
            res.status(400).json({ 
                success: false, 
                message: "Invalid refresh token" 
            });
            return;
        }
        await RefreshToken.deleteOne({ token: refreshToken });
        res.status(200).json({
            success: true,
            message: "User logged out successfully"
        });
        return;
    } catch (error) {
        logger.error("Error logging out user", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
        return;
    }
}





// export const loginUser = async (req: Request, res: Response) => {
//     logger.info("Login user endpoint...");
//     try {
//         const { email, password } = req.body;
//         //check if user exists
//         let user = await User.findOne({ email });
//         if(!user) {
//             logger.warn("User not found");
//             return res.status(404).json({ 
//                 success: false, 
//                 message: "User not found" 
//             });
//         }
//         //check if password is correct
//         const isMatch = await user.comparePassword(password);
//         if(!isMatch) {
//             logger.warn("Invalid password");
//             return res.status(400).json({ 
//                 success: false, 
//                 message: "Invalid password" 
//             });
//         }
//         const { token, refreshToken} = await generateToken(user);

//         return res.status(200).json({
//             success: true,
//             message: "User logged in successfully",
//             token,
//             refreshToken
//         });
//     } catch (error) {
//         logger.error("Error logging in user", error);
//         return res.status(500).json({
//             success: false,
//             message: "Internal server error"
//         });
//     }
// };