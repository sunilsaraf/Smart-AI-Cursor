import { pool } from '../../db';

export class UsersService {
  async getUserById(userId: string) {
    const result = await pool.query(
      'SELECT id, email, name, role, avatar_url, created_at FROM users WHERE id = $1',
      [userId]
    );
    return result.rows[0] || null;
  }

  async updateUser(userId: string, data: { name?: string; avatarUrl?: string }) {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name) {
      updates.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }

    if (data.avatarUrl) {
      updates.push(`avatar_url = $${paramIndex++}`);
      values.push(data.avatarUrl);
    }

    values.push(userId);

    const result = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id, email, name, avatar_url`,
      values
    );

    return result.rows[0];
  }
}

export const usersService = new UsersService();
