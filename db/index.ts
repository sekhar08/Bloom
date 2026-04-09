import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@/db/schema';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not configured.');
  }

  return databaseUrl;
}

let dbInstance: NeonHttpDatabase<typeof schema> | null = null;

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

export function getDb() {
  if (dbInstance) {
    return dbInstance;
  }

  const client = neon(getDatabaseUrl());
  dbInstance = drizzle(client, { schema });

  return dbInstance;
}

export { schema };
