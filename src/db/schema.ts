import { relations } from 'drizzle-orm';
import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const rfqs = pgTable('rfqs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  priority: text('priority').notNull(), // 'low', 'medium', 'high'
  description: text('description').notNull(),
  status: text('status').default('pending').notNull(), // 'pending', 'quoted', 'awarded'
  createdAt: timestamp('created_at').defaultNow(),
});

export const insights = pgTable('insights', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  content: text('content').notNull(),
  author: text('author').notNull().default('Redacción'),
  image: text('image'),
  videoUrl: text('video_url'),
  sourceUrl: text('source_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  rfqs: many(rfqs),
}));

export const rfqsRelations = relations(rfqs, ({ one }) => ({
  user: one(users, {
    fields: [rfqs.userId],
    references: [users.id],
  }),
}));
