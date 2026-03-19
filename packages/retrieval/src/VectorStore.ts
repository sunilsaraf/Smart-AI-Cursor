import { Pool } from 'pg';

export interface SearchResult {
  id: string;
  content: string;
  score: number;
  metadata: any;
}

export abstract class VectorStore {
  abstract insert(
    id: string,
    vector: number[],
    content: string,
    metadata: any
  ): Promise<void>;

  abstract insertBatch(
    items: Array<{
      id: string;
      vector: number[];
      content: string;
      metadata: any;
    }>
  ): Promise<void>;

  abstract search(
    queryVector: number[],
    topK: number,
    filter?: any
  ): Promise<SearchResult[]>;

  abstract delete(id: string): Promise<void>;

  abstract deleteBatch(ids: string[]): Promise<void>;

  abstract update(
    id: string,
    vector?: number[],
    content?: string,
    metadata?: any
  ): Promise<void>;

  abstract count(filter?: any): Promise<number>;

  abstract close(): Promise<void>;
}

export class PgVectorStore extends VectorStore {
  private pool: Pool;
  private tableName: string;

  constructor(connectionString: string, tableName = 'code_embeddings') {
    super();
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
      throw new Error(`Invalid table name: ${tableName}. Must contain only alphanumeric characters and underscores.`);
    }
    this.pool = new Pool({ connectionString });
    this.tableName = tableName;
  }

  async initialize(): Promise<void> {
    await this.pool.query('CREATE EXTENSION IF NOT EXISTS vector');
    
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        id TEXT PRIMARY KEY,
        vector vector(1536),
        content TEXT NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await this.pool.query(`
      CREATE INDEX IF NOT EXISTS ${this.tableName}_vector_idx 
      ON ${this.tableName} 
      USING ivfflat (vector vector_cosine_ops)
      WITH (lists = 100)
    `);
  }

  async insert(
    id: string,
    vector: number[],
    content: string,
    metadata: any
  ): Promise<void> {
    const vectorStr = `[${vector.join(',')}]`;
    await this.pool.query(
      `INSERT INTO ${this.tableName} (id, vector, content, metadata)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE 
       SET vector = $2, content = $3, metadata = $4`,
      [id, vectorStr, content, JSON.stringify(metadata)]
    );
  }

  async insertBatch(
    items: Array<{
      id: string;
      vector: number[];
      content: string;
      metadata: any;
    }>
  ): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      
      for (const item of items) {
        const vectorStr = `[${item.vector.join(',')}]`;
        await client.query(
          `INSERT INTO ${this.tableName} (id, vector, content, metadata)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (id) DO UPDATE 
           SET vector = $2, content = $3, metadata = $4`,
          [item.id, vectorStr, item.content, JSON.stringify(item.metadata)]
        );
      }
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async search(
    queryVector: number[],
    topK: number,
    filter?: any
  ): Promise<SearchResult[]> {
    const vectorStr = `[${queryVector.join(',')}]`;
    
    let query = `
      SELECT 
        id,
        content,
        metadata,
        1 - (vector <=> $1::vector) as score
      FROM ${this.tableName}
    `;
    
    const params: any[] = [vectorStr];
    
    if (filter) {
      const conditions: string[] = [];
      let paramIndex = 2;
      
      if (filter.repositoryId) {
        conditions.push(`metadata->>'repositoryId' = $${paramIndex}`);
        params.push(filter.repositoryId);
        paramIndex++;
      }
      
      if (filter.language) {
        conditions.push(`metadata->>'language' = $${paramIndex}`);
        params.push(filter.language);
        paramIndex++;
      }
      
      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }
    }
    
    params.push(topK);
    query += ` ORDER BY vector <=> $1::vector LIMIT $${params.length}`;

    const result = await this.pool.query(query, params);

    return result.rows.map(row => ({
      id: row.id,
      content: row.content,
      score: parseFloat(row.score),
      metadata: row.metadata,
    }));
  }

  async delete(id: string): Promise<void> {
    await this.pool.query(`DELETE FROM ${this.tableName} WHERE id = $1`, [id]);
  }

  async deleteBatch(ids: string[]): Promise<void> {
    await this.pool.query(
      `DELETE FROM ${this.tableName} WHERE id = ANY($1)`,
      [ids]
    );
  }

  async update(
    id: string,
    vector?: number[],
    content?: string,
    metadata?: any
  ): Promise<void> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (vector) {
      updates.push(`vector = $${paramIndex}`);
      params.push(`[${vector.join(',')}]`);
      paramIndex++;
    }

    if (content !== undefined) {
      updates.push(`content = $${paramIndex}`);
      params.push(content);
      paramIndex++;
    }

    if (metadata !== undefined) {
      updates.push(`metadata = $${paramIndex}`);
      params.push(JSON.stringify(metadata));
      paramIndex++;
    }

    if (updates.length === 0) {
      return;
    }

    params.push(id);
    await this.pool.query(
      `UPDATE ${this.tableName} SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      params
    );
  }

  async count(filter?: any): Promise<number> {
    let query = `SELECT COUNT(*) FROM ${this.tableName}`;
    const params: any[] = [];

    if (filter) {
      const conditions: string[] = [];
      let paramIndex = 1;

      if (filter.repositoryId) {
        conditions.push(`metadata->>'repositoryId' = $${paramIndex}`);
        params.push(filter.repositoryId);
        paramIndex++;
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }
    }

    const result = await this.pool.query(query, params);
    return parseInt(result.rows[0].count, 10);
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
