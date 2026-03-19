import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';

export const workspacesRouter = Router();

workspacesRouter.use(authMiddleware);

workspacesRouter.get('/', async (req, res) => {
  res.json({ workspaces: [] });
});

workspacesRouter.post('/', async (req, res) => {
  res.json({ message: 'Create workspace', data: req.body });
});

workspacesRouter.get('/:id', async (req, res) => {
  res.json({ message: 'Get workspace', id: req.params.id });
});

workspacesRouter.patch('/:id', async (req, res) => {
  res.json({ message: 'Update workspace', id: req.params.id });
});

workspacesRouter.delete('/:id', async (req, res) => {
  res.json({ message: 'Delete workspace', id: req.params.id });
});
