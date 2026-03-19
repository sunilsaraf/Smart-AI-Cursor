import { pool } from '../../db';

export class ChatService {
  async createSession(workspaceId: string, userId: string, data: any) {
    const result = await pool.query(
      `INSERT INTO chat_sessions (workspace_id, user_id, title, model, system_prompt, metadata)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [workspaceId, userId, data.title, data.model, data.systemPrompt, JSON.stringify(data.metadata || {})]
    );
    return result.rows[0];
  }

  async getSessionsByWorkspace(workspaceId: string) {
    const result = await pool.query(
      'SELECT * FROM chat_sessions WHERE workspace_id = $1 ORDER BY created_at DESC',
      [workspaceId]
    );
    return result.rows;
  }

  async getSessionById(sessionId: string) {
    const result = await pool.query(
      'SELECT * FROM chat_sessions WHERE id = $1',
      [sessionId]
    );
    return result.rows[0] || null;
  }

  async addMessage(sessionId: string, role: string, content: string, metadata?: any) {
    const result = await pool.query(
      `INSERT INTO chat_messages (session_id, role, content, metadata)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [sessionId, role, content, JSON.stringify(metadata || {})]
    );
    return result.rows[0];
  }

  async getMessagesBySession(sessionId: string) {
    const result = await pool.query(
      'SELECT * FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC',
      [sessionId]
    );
    return result.rows;
  }
}

export const chatService = new ChatService();
