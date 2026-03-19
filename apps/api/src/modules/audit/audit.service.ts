import { pool } from '../../db';

export class AuditService {
  async logEvent(
    userId: string | null,
    action: string,
    resource: string,
    resourceId?: string,
    metadata?: any,
    ipAddress?: string,
    userAgent?: string
  ) {
    await pool.query(
      `INSERT INTO audit_events (user_id, action, resource, resource_id, metadata, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, action, resource, resourceId, JSON.stringify(metadata || {}), ipAddress, userAgent]
    );
  }

  async getEventsByUser(userId: string, limit = 100) {
    const result = await pool.query(
      'SELECT * FROM audit_events WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
      [userId, limit]
    );
    return result.rows;
  }
}

export const auditService = new AuditService();
