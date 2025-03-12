import {  validateCreatePost } from "../utils/validation";
import Post from "../models/postModel";
import { logger } from "../utils/logger";
import { Request,Response } from "express";



export const createPost = async (req: Request, res: Response): Promise<void> => {
  logger.info("Creating a new post endpoint hit...");  
  try {
      // Validate user input
      const { error } = validateCreatePost(
        req.body.title?.trim(), 
        req.body.content?.trim().toLowerCase()
      );
      if (error) {
          logger.warn("Validation error details", JSON.stringify(error.details, null, 2));
          res.status(400).json({ 
              success: false, 
              message: error.details[0].message 
          });
          return;  // Ensure early return
      }
      
      // Ensure user exists
      if (!req.user?.userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized - No user found",
        });
        return;
      }
  
      // Create post
      const { title, content, mediaIds } = req.body;
      const newPost = new Post({
        user: req.user.userId,
        title,
        content,
        mediaIds: mediaIds || [],
      });
  
      await newPost.save();
      logger.info("Post created successfully");
      res.status(201).json({
        success: true,
        message: "Post created successfully",
      });
  
    } catch (error) {
      logger.error("Error creating post", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
};


  

export const getAllPosts = async (req: Request, res: Response) => {
  try {
    // Get posts
    // pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const startIndex = (page - 1) * limit;
    
    // Get posts from cache
    const cacheKey = `posts-${page}-${limit}`;
    if (!req.redisClient) {
      logger.warn('Redis client is not available');
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
      return;
    }
    const cachedPosts = await req.redisClient.get(cacheKey);

    if (cachedPosts) {
      logger.info('Posts retrieved from cache');
      res.status(200).json({
        success: true,
        posts: JSON.parse(cachedPosts),
      });
      return;
    }

    const posts = await Post.find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(startIndex);

    const totalNoOfPosts = await Post.countDocuments();

    // Cache posts
    const result = {
      posts,
      currentpaage: page,
      totalpages: Math.ceil(totalNoOfPosts / limit),
      totalPosts: totalNoOfPosts
    }

    // save your posts in redis cache 
    await req.redisClient.setex(cacheKey, 300, JSON.stringify(result));

    res.status(200).json({
      success: true,
      posts: result,
    });
  } catch (error) {
    logger.error('Error getting posts', error);
res.status(500).json({
    sucess: false,
    message: "Internal server error"});
  }
}

export const getPost = async (req: Request, res: Response) => {
    try {
      // Get posts
      res.status(200).send("Get posts");
    } catch (error) {
      logger.error('Error getting a post by ID', error);
  res.status(500).json({
      sucess: false,
      message: "Internal server error"});
    }
  }

  export const updatePost = async (req: Request, res: Response) => {
    try {
      // Update post
      res.status(200).send("Post updated");
    } catch (error) {
      logger.error('Error updating post', error);
    res.status(500).json({
        sucess: false,
        message: "Internal server error"});
    }
    }

    export const deletePost = async (req: Request, res: Response) => {
      try {
        // Delete post
        res.status(200).send("Post deleted");
      } catch (error) {
        logger.error('Error deleting post', error);
      res.status(500).json({
          sucess: false,
          message: "Internal server error"});
      }
      }