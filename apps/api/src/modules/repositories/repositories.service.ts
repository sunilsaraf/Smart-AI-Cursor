import { pool } from '../../db';

export class RepositoriesService {
  async createRepository(workspaceId: string, data: any) {
    const result = await pool.query(
      `INSERT INTO repositories (workspace_id, name, path, git_url, branch)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [workspaceId, data.name, data.path, data.gitUrl, data.branch]
    );
    return result.rows[0];
  }

  async getRepositoriesByWorkspace(workspaceId: string) {
    const result = await pool.query(
      'SELECT * FROM repositories WHERE workspace_id = $1 ORDER BY created_at DESC',
      [workspaceId]
    );
    return result.rows;
  }

  async getRepositoryById(repositoryId: string) {
    const result = await pool.query(
      'SELECT * FROM repositories WHERE id = $1',
      [repositoryId]
    );
    return result.rows[0] || null;
  }

  async updateIndexingStatus(repositoryId: string, status: string) {
    await pool.query(
      'UPDATE repositories SET indexing_status = $1, last_indexed_at = NOW() WHERE id = $2',
      [status, repositoryId]
    );
  }

  async getFilesByRepository(repositoryId: string) {
    const result = await pool.query(
      'SELECT * FROM files WHERE repository_id = $1 ORDER BY path',
      [repositoryId]
    );
    return result.rows;
  }
}

export const repositoriesService = new RepositoriesService();
