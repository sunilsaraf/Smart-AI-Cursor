import OpenAI from 'openai';

export abstract class EmbeddingAdapter {
  abstract embed(texts: string[]): Promise<number[][]>;
  abstract embedSingle(text: string): Promise<number[]>;
  abstract getDimensions(): number;
  abstract getModel(): string;
}

export class OpenAIEmbeddingAdapter extends EmbeddingAdapter {
  private client: OpenAI;
  private model: string;
  private dimensions: number;

  constructor(apiKey: string, model = 'text-embedding-3-small', dimensions = 1536) {
    super();
    this.client = new OpenAI({ apiKey });
    this.model = model;
    this.dimensions = dimensions;
  }

  async embed(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) {
      return [];
    }

    const batchSize = 100;
    const results: number[][] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const response = await this.client.embeddings.create({
        model: this.model,
        input: batch,
        dimensions: this.dimensions,
      });

      results.push(...response.data.map(d => d.embedding));
    }

    return results;
  }

  async embedSingle(text: string): Promise<number[]> {
    const results = await this.embed([text]);
    return results[0];
  }

  getDimensions(): number {
    return this.dimensions;
  }

  getModel(): string {
    return this.model;
  }
}

export class CachedEmbeddingAdapter extends EmbeddingAdapter {
  private cache: Map<string, number[]> = new Map();
  private adapter: EmbeddingAdapter;

  constructor(adapter: EmbeddingAdapter) {
    super();
    this.adapter = adapter;
  }

  async embed(texts: string[]): Promise<number[][]> {
    const results: number[][] = [];
    const textsToEmbed: string[] = [];
    const indices: number[] = [];

    for (let i = 0; i < texts.length; i++) {
      const cached = this.cache.get(texts[i]);
      if (cached) {
        results[i] = cached;
      } else {
        textsToEmbed.push(texts[i]);
        indices.push(i);
      }
    }

    if (textsToEmbed.length > 0) {
      const newEmbeddings = await this.adapter.embed(textsToEmbed);
      
      for (let i = 0; i < textsToEmbed.length; i++) {
        const text = textsToEmbed[i];
        const embedding = newEmbeddings[i];
        this.cache.set(text, embedding);
        results[indices[i]] = embedding;
      }
    }

    return results;
  }

  async embedSingle(text: string): Promise<number[]> {
    const results = await this.embed([text]);
    return results[0];
  }

  getDimensions(): number {
    return this.adapter.getDimensions();
  }

  getModel(): string {
    return this.adapter.getModel();
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}
