import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export type TaskType = 'chat' | 'edit' | 'embed' | 'summarize' | 'rerank' | 'completion';

export interface ModelConfig {
  provider: 'openai' | 'anthropic' | 'cohere';
  model: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  streaming?: boolean;
}

export interface ModelRouterOptions {
  openaiApiKey?: string;
  anthropicApiKey?: string;
  cohereApiKey?: string;
  defaultModels?: Partial<Record<TaskType, ModelConfig>>;
}

export class ModelRouter {
  private openai?: OpenAI;
  private anthropic?: Anthropic;
  private defaultModels: Record<TaskType, ModelConfig>;

  constructor(options: ModelRouterOptions = {}) {
    if (options.openaiApiKey) {
      this.openai = new OpenAI({ apiKey: options.openaiApiKey });
    }
    
    if (options.anthropicApiKey) {
      this.anthropic = new Anthropic({ apiKey: options.anthropicApiKey });
    }

    this.defaultModels = {
      chat: { provider: 'openai', model: 'gpt-4-turbo-preview', temperature: 0.7 },
      edit: { provider: 'openai', model: 'gpt-4-turbo-preview', temperature: 0.3 },
      embed: { provider: 'openai', model: 'text-embedding-3-small' },
      summarize: { provider: 'openai', model: 'gpt-3.5-turbo', temperature: 0.5 },
      rerank: { provider: 'cohere', model: 'rerank-english-v2.0' },
      completion: { provider: 'openai', model: 'gpt-4-turbo-preview', temperature: 0.7 },
      ...options.defaultModels,
    };
  }

  getModelForTask(task: TaskType, customModel?: ModelConfig): ModelConfig {
    return customModel || this.defaultModels[task];
  }

  async chat(
    messages: Array<{ role: string; content: string }>,
    config?: Partial<ModelConfig>
  ): Promise<string> {
    const modelConfig = this.getModelForTask('chat', config as ModelConfig);

    if (modelConfig.provider === 'openai' && this.openai) {
      const response = await this.openai.chat.completions.create({
        model: modelConfig.model,
        messages: messages as any,
        temperature: modelConfig.temperature,
        max_tokens: modelConfig.maxTokens,
        top_p: modelConfig.topP,
      });
      return response.choices[0]?.message?.content || '';
    }

    if (modelConfig.provider === 'anthropic' && this.anthropic) {
      const systemMessage = messages.find(m => m.role === 'system');
      const otherMessages = messages.filter(m => m.role !== 'system');

      const response = await this.anthropic.messages.create({
        model: modelConfig.model,
        max_tokens: modelConfig.maxTokens || 4096,
        temperature: modelConfig.temperature,
        system: systemMessage?.content,
        messages: otherMessages as any,
      });

      return response.content[0]?.type === 'text' ? response.content[0].text : '';
    }

    throw new Error(`Provider ${modelConfig.provider} not configured`);
  }

  async *chatStream(
    messages: Array<{ role: string; content: string }>,
    config?: Partial<ModelConfig>
  ): AsyncGenerator<string> {
    const modelConfig = this.getModelForTask('chat', config as ModelConfig);

    if (modelConfig.provider === 'openai' && this.openai) {
      const stream = await this.openai.chat.completions.create({
        model: modelConfig.model,
        messages: messages as any,
        temperature: modelConfig.temperature,
        max_tokens: modelConfig.maxTokens,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          yield content;
        }
      }
    } else if (modelConfig.provider === 'anthropic' && this.anthropic) {
      const systemMessage = messages.find(m => m.role === 'system');
      const otherMessages = messages.filter(m => m.role !== 'system');

      const stream = await this.anthropic.messages.stream({
        model: modelConfig.model,
        max_tokens: modelConfig.maxTokens || 4096,
        temperature: modelConfig.temperature,
        system: systemMessage?.content,
        messages: otherMessages as any,
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          yield event.delta.text;
        }
      }
    } else {
      throw new Error(`Provider ${modelConfig.provider} not configured for streaming`);
    }
  }

  async embed(texts: string[], config?: Partial<ModelConfig>): Promise<number[][]> {
    const modelConfig = this.getModelForTask('embed', config as ModelConfig);

    if (modelConfig.provider === 'openai' && this.openai) {
      const response = await this.openai.embeddings.create({
        model: modelConfig.model,
        input: texts,
      });
      return response.data.map(d => d.embedding);
    }

    throw new Error(`Embeddings not supported for provider ${modelConfig.provider}`);
  }

  async summarize(text: string, config?: Partial<ModelConfig>): Promise<string> {
    const modelConfig = this.getModelForTask('summarize', config as ModelConfig);
    const messages = [
      { role: 'system', content: 'You are a helpful assistant that summarizes text concisely.' },
      { role: 'user', content: `Summarize the following text:\n\n${text}` },
    ];
    return this.chat(messages, modelConfig);
  }

  async edit(
    instruction: string,
    code: string,
    config?: Partial<ModelConfig>
  ): Promise<string> {
    const modelConfig = this.getModelForTask('edit', config as ModelConfig);
    const messages = [
      {
        role: 'system',
        content: 'You are an expert code editor. Apply the requested changes to the code precisely.',
      },
      {
        role: 'user',
        content: `Instruction: ${instruction}\n\nCode:\n\`\`\`\n${code}\n\`\`\`\n\nProvide only the edited code without explanation.`,
      },
    ];
    return this.chat(messages, modelConfig);
  }

  isConfigured(provider: 'openai' | 'anthropic' | 'cohere'): boolean {
    if (provider === 'openai') return !!this.openai;
    if (provider === 'anthropic') return !!this.anthropic;
    return false;
  }
}
