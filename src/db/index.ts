import Database from 'better-sqlite3';
import { drizzle } from "drizzle-orm/better-sqlite3";

const db = new Database("database/sqlite.db");
export const drizzleDb = drizzle(db);