import { Pool } from "pg";

const g = globalThis as unknown as { pool?: Pool };
export const pool = g.pool ?? new Pool({ connectionString: process.env.DATABASE_URL });
if (process.env.NODE_ENV !== "production") g.pool = pool;

export async function q(sql: string, params: any[] = []): Promise<any[]> {
  return (await pool.query(sql, params)).rows;
}
export async function q1(sql: string, params: any[] = []): Promise<any | null> {
  return (await q(sql, params))[0] ?? null;
}
