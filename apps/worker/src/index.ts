import dotenv from 'dotenv';
import { Worker } from 'bullmq';
import { queue, connection } from './queue/queue';
import { processIndexingJob } from './jobs/indexing.job';
import { processEmbeddingJob } from './jobs/embedding.job';
import { processSummarizationJob } from './jobs/summarization.job';

dotenv.config();

const worker = new Worker(
  'codepilot',
  async (job) => {
    console.log(`Processing job ${job.id} of type ${job.name}`);
    
    switch (job.name) {
      case 'indexing':
        return await processIndexingJob(job.data);
      case 'embedding':
        return await processEmbeddingJob(job.data);
      case 'summarization':
        return await processSummarizationJob(job.data);
      default:
        throw new Error(`Unknown job type: ${job.name}. Valid types are: indexing, embedding, summarization`);
    }
  },
  {
    connection,
    concurrency: parseInt(process.env.WORKER_CONCURRENCY || '5', 10),
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 100 },
  }
);

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

worker.on('error', (err) => {
  console.error('Worker error:', err);
});

console.log('🚀 Worker started successfully');
console.log(`📝 Concurrency: ${parseInt(process.env.WORKER_CONCURRENCY || '5', 10)}`);

process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing worker');
  await worker.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing worker');
  await worker.close();
  process.exit(0);
});
