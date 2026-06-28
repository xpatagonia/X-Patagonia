import { db } from './index.ts';
import { rfqs } from './schema.ts';
import { eq, desc } from 'drizzle-orm';

export async function getUserRfqs(userId: number) {
  return await db.select().from(rfqs).where(eq(rfqs.userId, userId)).orderBy(desc(rfqs.createdAt));
}

export async function createRfq(userId: number, data: { title: string, category: string, priority: string, description: string }) {
  const result = await db.insert(rfqs).values({
    userId,
    title: data.title,
    category: data.category,
    priority: data.priority,
    description: data.description,
  }).returning();
  
  return result[0];
}
