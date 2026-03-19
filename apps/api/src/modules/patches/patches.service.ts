import { pool } from '../../db';

export class PatchesService {
  async createPatch(userId: string, repositoryId: string, diff: string, files: any[]) {
    const result = await pool.query(
      `INSERT INTO patches (user_id, repository_id, diff, files, status)
       VALUES ($1, $2, $3, $4, 'pending') RETURNING *`,
      [userId, repositoryId, diff, JSON.stringify(files)]
    );
    return result.rows[0];
  }

  async getPatchById(patchId: string) {
    const result = await pool.query(
      'SELECT * FROM patches WHERE id = $1',
      [patchId]
    );
    return result.rows[0] || null;
  }

  async applyPatch(patchId: string) {
    await pool.query(
      "UPDATE patches SET status = 'applied', applied_at = NOW() WHERE id = $1",
      [patchId]
    );
  }

  async rejectPatch(patchId: string) {
    await pool.query(
      "UPDATE patches SET status = 'rejected' WHERE id = $1",
      [patchId]
    );
  }
}

export const patchesService = new PatchesService();
