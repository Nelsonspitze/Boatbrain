import { eq } from 'drizzle-orm';
import { db } from '../db';
import { aiCache } from '../db/schema';
import { randomUUID } from 'expo-crypto';

function hashKey(input: string): string {
  // Simple deterministic key — in production use a real hash
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export async function getCachedResponse(
  prompt: string,
  boatId?: string,
  type: string = 'general',
): Promise<string | null> {
  const key = hashKey(`${type}:${boatId ?? ''}:${prompt}`);
  const now = new Date().toISOString();

  const rows = await db
    .select()
    .from(aiCache)
    .where(eq(aiCache.cacheKey, key))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  // Check expiry
  if (row.expiresAt && row.expiresAt < now) {
    await db.delete(aiCache).where(eq(aiCache.id, row.id));
    return null;
  }

  return row.response;
}

export async function setCachedResponse(
  prompt: string,
  response: string,
  type: string = 'general',
  boatId?: string,
  ttlDays = 30,
): Promise<void> {
  const key = hashKey(`${type}:${boatId ?? ''}:${prompt}`);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlDays * 24 * 60 * 60 * 1000).toISOString();

  await db
    .insert(aiCache)
    .values({
      id: randomUUID(),
      cacheKey: key,
      prompt,
      response,
      boatId: boatId ?? null,
      type,
      createdAt: now.toISOString(),
      expiresAt,
    })
    .onConflictDoUpdate({
      target: aiCache.cacheKey,
      set: { response, createdAt: now.toISOString(), expiresAt },
    });
}
