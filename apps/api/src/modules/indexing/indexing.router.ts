import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';

export const indexingRouter = Router();

indexingRouter.use(authMiddleware);

indexingRouter.post('/trigger', async (req, res) => {
  res.json({ message: 'Indexing triggered', repositoryId: req.body.repositoryId });
});

indexingRouter.get('/:repositoryId/status', async (req, res) => {
  res.json({
    repositoryId: req.params.repositoryId,
    status: 'completed',
    progress: 100,
    filesProcessed: 0,
    totalFiles: 0,
    chunksGenerated: 0,
  });
});
