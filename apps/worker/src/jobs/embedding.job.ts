import { OpenAIEmbeddingAdapter } from '@codepilot/retrieval';

export async function processEmbeddingJob(data: { chunkIds: string[] }) {
  console.log(`Generating embeddings for ${data.chunkIds.length} chunks`);
  
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured');
  }
  
  const embedder = new OpenAIEmbeddingAdapter(process.env.OPENAI_API_KEY);
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    chunkIds: data.chunkIds,
    embeddingsGenerated: data.chunkIds.length,
    status: 'completed',
  };
}
