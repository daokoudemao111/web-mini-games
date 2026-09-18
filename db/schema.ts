import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
export const rooms = sqliteTable('rooms', { code: text('code').primaryKey(), state: text('state').notNull(), version: integer('version').notNull().default(0), updatedAt: integer('updated_at').notNull() });
export const drawingBoards = sqliteTable('drawing_boards', { turnKey: text('turn_key').primaryKey(), roomCode: text('room_code').notNull(), state: text('state').notNull(), version: integer('version').notNull().default(0) });
