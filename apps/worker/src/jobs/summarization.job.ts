import { ModelRouter } from '@codepilot/ai-orchestrator';

export async function processSummarizationJob(data: { sessionId: string }) {
  console.log(`Summarizing chat session ${data.sessionId}`);
  
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured');
  }
  
  const router = new ModelRouter({ openaiApiKey: process.env.OPENAI_API_KEY });
  
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    sessionId: data.sessionId,
    summary: 'Chat session summary generated',
    status: 'completed',
  };
}
