import express from "express";
import { createPost, getAllPosts, getPost, updatePost, deletePost } from "../controllers/postController";
import { authUser } from "../middleware/authMiddleware";

const router = express.Router();

router.use( authUser );

router.post("/create-post", createPost);
router.get("/all-posts", getAllPosts);
router.get("/:id", getPost);
router.delete("/:id", deletePost);

export default router;