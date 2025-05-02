import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { env } from "~/env";
import * as schema from "./schema";

if (process.env.DATABASE_URL === undefined) {
  throw new Error("DATABASE_URL is not set");
}

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const connectionString = process.env.DATABASE_URL;
console.log('Connection string being used:', connectionString);
// Disable prefetch as it is not supported for "Transaction" pool mode
const client = postgres(connectionString, { prepare: false });

if (env.NODE_ENV !== "production") globalForDb.conn = client;

export const db = drizzle(client, { schema });
