import { pool } from '../../db';

export class WorkspacesService {
  async createWorkspace(ownerId: string, name: string, description?: string) {
    const result = await pool.query(
      'INSERT INTO workspaces (owner_id, name, description) VALUES ($1, $2, $3) RETURNING *',
      [ownerId, name, description]
    );
    return result.rows[0];
  }

  async getWorkspacesByUserId(userId: string) {
    const result = await pool.query(
      'SELECT * FROM workspaces WHERE owner_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }

  async getWorkspaceById(workspaceId: string) {
    const result = await pool.query(
      'SELECT * FROM workspaces WHERE id = $1',
      [workspaceId]
    );
    return result.rows[0] || null;
  }

  async updateWorkspace(workspaceId: string, data: { name?: string; description?: string; settings?: any }) {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name) {
      updates.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }

    if (data.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(data.description);
    }

    if (data.settings) {
      updates.push(`settings = $${paramIndex++}`);
      values.push(JSON.stringify(data.settings));
    }

    values.push(workspaceId);

    const result = await pool.query(
      `UPDATE workspaces SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return result.rows[0];
  }

  async deleteWorkspace(workspaceId: string) {
    await pool.query('DELETE FROM workspaces WHERE id = $1', [workspaceId]);
  }
}

export const workspacesService = new WorkspacesService();
