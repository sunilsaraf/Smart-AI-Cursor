import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';

export const usersRouter = Router();

usersRouter.use(authMiddleware);

usersRouter.get('/:id', async (req, res) => {
  res.json({ message: 'Get user by ID', userId: req.params.id });
});

usersRouter.patch('/:id', async (req, res) => {
  res.json({ message: 'Update user', userId: req.params.id });
});
