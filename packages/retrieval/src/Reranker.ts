export interface RerankResult {
  index: number;
  score: number;
  document: string;
}

export abstract class Reranker {
  abstract rerank(
    query: string,
    documents: string[],
    topK?: number
  ): Promise<RerankResult[]>;
}

export class CohereReranker extends Reranker {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model = 'rerank-english-v2.0') {
    super();
    this.apiKey = apiKey;
    this.model = model;
  }

  async rerank(
    query: string,
    documents: string[],
    topK?: number
  ): Promise<RerankResult[]> {
    const response = await fetch('https://api.cohere.ai/v1/rerank', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        query,
        documents,
        top_n: topK || documents.length,
      }),
    });

    if (!response.ok) {
      throw new Error(`Cohere rerank failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    return data.results.map((result: any) => ({
      index: result.index,
      score: result.relevance_score,
      document: documents[result.index],
    }));
  }
}

export class LocalReranker extends Reranker {
  async rerank(
    query: string,
    documents: string[],
    topK?: number
  ): Promise<RerankResult[]> {
    const queryTokens = this.tokenize(query.toLowerCase());
    
    const scored = documents.map((doc, index) => {
      const docTokens = this.tokenize(doc.toLowerCase());
      const score = this.calculateScore(queryTokens, docTokens);
      return { index, score, document: doc };
    });

    scored.sort((a, b) => b.score - a.score);
    
    return scored.slice(0, topK || documents.length);
  }

  private tokenize(text: string): Set<string> {
    return new Set(
      text
        .split(/\W+/)
        .filter(token => token.length > 2)
    );
  }

  private calculateScore(queryTokens: Set<string>, docTokens: Set<string>): number {
    let matches = 0;
    for (const token of queryTokens) {
      if (docTokens.has(token)) {
        matches++;
      }
    }
    
    if (queryTokens.size === 0) {
      return 0;
    }
    
    const recall = matches / queryTokens.size;
    const precision = docTokens.size > 0 ? matches / docTokens.size : 0;
    
    if (recall + precision === 0) {
      return 0;
    }
    
    return (2 * recall * precision) / (recall + precision);
  }
}
