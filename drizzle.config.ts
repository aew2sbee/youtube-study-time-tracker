import type { Config } from 'drizzle-kit';
import 'dotenv/config';

export default {
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql', // ← Supabase(Postgres)なのでこれ！
  dbCredentials: {
    url: process.env.DATABASE_URL!, // Supabase の接続URLを.envから取得
  },
} satisfies Config;
