import { db } from './src/db/index.ts';
import { insights } from './src/db/schema.ts';
async function test() {
  const all = await db.select().from(insights);
  console.log('Insights count:', all.length);
  process.exit(0);
}
test().catch(console.error);
