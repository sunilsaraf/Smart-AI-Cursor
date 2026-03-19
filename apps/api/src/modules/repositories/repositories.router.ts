import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';

export const repositoriesRouter = Router();

repositoriesRouter.use(authMiddleware);

repositoriesRouter.get('/', async (req, res) => {
  res.json({ repositories: [] });
});

repositoriesRouter.post('/', async (req, res) => {
  res.json({ message: 'Create repository', data: req.body });
});

repositoriesRouter.get('/:id', async (req, res) => {
  res.json({ message: 'Get repository', id: req.params.id });
});

repositoriesRouter.post('/:id/index', async (req, res) => {
  res.json({ message: 'Index repository', id: req.params.id });
});

repositoriesRouter.get('/:id/files', async (req, res) => {
  res.json({ files: [], repositoryId: req.params.id });
});
