import { pool } from '../../db';

export class BillingService {
  async recordUsage(
    userId: string,
    workspaceId: string,
    model: string,
    operation: string,
    inputTokens: number,
    outputTokens: number
  ) {
    const cost = this.calculateCost(model, inputTokens, outputTokens);

    await pool.query(
      `INSERT INTO usage_records (user_id, workspace_id, model, operation, input_tokens, output_tokens, cost)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, workspaceId, model, operation, inputTokens, outputTokens, cost]
    );
  }

  calculateCost(model: string, inputTokens: number, outputTokens: number): number {
    const pricing: Record<string, { input: number; output: number }> = {
      'gpt-4-turbo-preview': { input: 0.01 / 1000, output: 0.03 / 1000 },
      'gpt-3.5-turbo': { input: 0.0005 / 1000, output: 0.0015 / 1000 },
      'claude-3-opus-20240229': { input: 0.015 / 1000, output: 0.075 / 1000 },
      'text-embedding-3-small': { input: 0.00002 / 1000, output: 0 },
    };

    const modelPricing = pricing[model] || { input: 0, output: 0 };
    return inputTokens * modelPricing.input + outputTokens * modelPricing.output;
  }

  async getUsageByUser(userId: string, startDate: Date, endDate: Date) {
    const result = await pool.query(
      `SELECT * FROM usage_records 
       WHERE user_id = $1 AND created_at BETWEEN $2 AND $3
       ORDER BY created_at DESC`,
      [userId, startDate, endDate]
    );
    return result.rows;
  }
}

export const billingService = new BillingService();
