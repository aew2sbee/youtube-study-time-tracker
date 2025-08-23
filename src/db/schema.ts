import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  channelId: text('channel_id').notNull(),
  name: text('name').notNull(),
  timeSec: integer('time_sec').notNull().default(0),
  updateTime: integer('update_time', { mode: 'timestamp' }).notNull(), // Date型
});
