import pg from 'pg';
import fs from 'node:fs';
import path from 'node:path';
const { Pool } = pg;

export const pool = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL, max: 10 }) : null;
export let databaseStatus: 'connected' | 'fallback' = 'fallback';
export async function connectDatabase() {
  if (!pool) return;
  try {
    await pool.query('SELECT 1');
    const schemaCandidates = [path.resolve(process.cwd(), 'database/init.sql'), path.resolve(process.cwd(), '../database/init.sql')];
    const schemaPath = schemaCandidates.find(candidate => fs.existsSync(candidate));
    if (schemaPath) await pool.query(fs.readFileSync(schemaPath, 'utf8'));
    databaseStatus = 'connected'; console.log('PostgreSQL connected');
  } catch { databaseStatus = 'fallback'; console.log('PostgreSQL unavailable — using seeded development store'); }
}
