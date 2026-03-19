import { pool } from '../../db';

export class AgentsService {
  async createRun(workspaceId: string, userId: string, type: string, input: string) {
    const result = await pool.query(
      `INSERT INTO agent_runs (workspace_id, user_id, type, input, status)
       VALUES ($1, $2, $3, $4, 'pending') RETURNING *`,
      [workspaceId, userId, type, input]
    );
    return result.rows[0];
  }

  async getRunById(runId: string) {
    const result = await pool.query(
      'SELECT * FROM agent_runs WHERE id = $1',
      [runId]
    );
    return result.rows[0] || null;
  }

  async updateRunStatus(runId: string, status: string, output?: string) {
    await pool.query(
      'UPDATE agent_runs SET status = $1, output = $2, completed_at = NOW() WHERE id = $3',
      [status, output, runId]
    );
  }

  async cancelRun(runId: string) {
    await pool.query(
      "UPDATE agent_runs SET status = 'cancelled', completed_at = NOW() WHERE id = $1",
      [runId]
    );
  }
}

export const agentsService = new AgentsService();
