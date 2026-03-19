import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';

export const searchRouter = Router();

searchRouter.use(authMiddleware);

searchRouter.post('/code', async (req, res) => {
  res.json({ results: [], totalResults: 0 });
});

searchRouter.post('/semantic', async (req, res) => {
  res.json({ results: [], totalResults: 0 });
});

searchRouter.post('/files', async (req, res) => {
  res.json({ results: [], totalResults: 0 });
});
