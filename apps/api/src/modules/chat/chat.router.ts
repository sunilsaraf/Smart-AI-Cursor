import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';

export const chatRouter = Router();

chatRouter.use(authMiddleware);

chatRouter.get('/sessions', async (req, res) => {
  res.json({ sessions: [] });
});

chatRouter.post('/sessions', async (req, res) => {
  res.json({ message: 'Create chat session', data: req.body });
});

chatRouter.get('/sessions/:id', async (req, res) => {
  res.json({ session: { id: req.params.id, title: 'Chat Session' } });
});

chatRouter.post('/sessions/:sessionId/messages', async (req, res) => {
  res.json({ message: 'Send message', sessionId: req.params.sessionId });
});

chatRouter.get('/sessions/:sessionId/messages', async (req, res) => {
  res.json({ messages: [], sessionId: req.params.sessionId });
});
