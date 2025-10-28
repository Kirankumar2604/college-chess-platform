import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', authenticateToken, (req, res) => {
  res.json({
    message: 'Protected route accessed successfully',
    user: {
      id: req.user.id,
      email: req.user.email
    }
  });
});

export default router;