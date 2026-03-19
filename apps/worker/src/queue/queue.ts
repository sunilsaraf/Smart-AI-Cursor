import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
});

export const queue = new Queue('codepilot', { connection });

export async function addIndexingJob(data: { repositoryId: string; force?: boolean }) {
  return await queue.add('indexing', data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  });
}

export async function addEmbeddingJob(data: { chunkIds: string[] }) {
  return await queue.add('embedding', data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  });
}

export async function addSummarizationJob(data: { sessionId: string }) {
  return await queue.add('summarization', data, {
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 3000,
    },
  });
}
