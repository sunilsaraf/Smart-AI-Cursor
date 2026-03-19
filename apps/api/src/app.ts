import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';

import { authRouter } from './modules/auth/auth.router';
import { usersRouter } from './modules/users/users.router';
import { workspacesRouter } from './modules/workspaces/workspaces.router';
import { repositoriesRouter } from './modules/repositories/repositories.router';
import { indexingRouter } from './modules/indexing/indexing.router';
import { chatRouter } from './modules/chat/chat.router';
import { searchRouter } from './modules/search/search.router';
import { agentsRouter } from './modules/agents/agents.router';
import { patchesRouter } from './modules/patches/patches.router';
import { terminalRouter } from './modules/terminal/terminal.router';

export const app = express();

app.use(helmet());
app.use(cors({ origin: config.corsOrigin.split(','), credentials: true }));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(rateLimiter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/workspaces', workspacesRouter);
app.use('/api/repositories', repositoriesRouter);
app.use('/api/indexing', indexingRouter);
app.use('/api/chat', chatRouter);
app.use('/api/search', searchRouter);
app.use('/api/agents', agentsRouter);
app.use('/api/patches', patchesRouter);
app.use('/api/terminal', terminalRouter);

app.use(errorHandler);
