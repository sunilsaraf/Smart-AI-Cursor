import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';

export const agentsRouter = Router();

agentsRouter.use(authMiddleware);

agentsRouter.post('/run', async (req, res) => {
  res.json({ id: 'mock-agent-run-id', status: 'pending', message: 'Agent run started' });
});

agentsRouter.get('/:id', async (req, res) => {
  res.json({ id: req.params.id, status: 'completed', output: 'Agent completed' });
});

agentsRouter.post('/:id/cancel', async (req, res) => {
  res.json({ message: 'Agent run cancelled', id: req.params.id });
});
