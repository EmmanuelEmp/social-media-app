import express from 'express';
import { searchPost } from '../controllers/searchController';
import { authUser } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authUser);

router.get('/search', searchPost);

export default router;