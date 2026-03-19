import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://codepilot:codepilot@localhost:5432/codepilot',
});

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const userResult = await pool.query(
      `INSERT INTO users (email, password_hash, name, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET name = $3
       RETURNING id, email, name`,
      ['admin@codepilot.dev', hashedPassword, 'Admin User', 'admin']
    );

    const user = userResult.rows[0];
    console.log('✅ Created admin user:', user.email);

    const workspaceResult = await pool.query(
      `INSERT INTO workspaces (owner_id, name, description)
       VALUES ($1, $2, $3)
       RETURNING id, name`,
      [user.id, 'Default Workspace', 'Your default workspace']
    );

    const workspace = workspaceResult.rows[0];
    console.log('✅ Created default workspace:', workspace.name);

    const repoResult = await pool.query(
      `INSERT INTO repositories (workspace_id, name, path, indexing_status)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name`,
      [workspace.id, 'Example Repository', '/example/path', 'pending']
    );

    const repo = repoResult.rows[0];
    console.log('✅ Created example repository:', repo.name);

    console.log('\n🎉 Seeding complete!');
    console.log('\nLogin credentials:');
    console.log('  Email: admin@codepilot.dev');
    console.log('  Password: admin123');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
