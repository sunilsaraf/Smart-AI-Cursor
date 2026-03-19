import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';

export const terminalRouter = Router();

terminalRouter.use(authMiddleware);

terminalRouter.post('/sessions', async (req, res) => {
  res.json({ sessionId: 'mock-terminal-session', message: 'Terminal session created' });
});

terminalRouter.post('/execute', async (req, res) => {
  res.json({ output: 'Command executed', exitCode: 0 });
});
