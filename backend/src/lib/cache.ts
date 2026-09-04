import { createClient, RedisClientType } from 'redis';

let client: RedisClientType | null = null;
let connected = false;
export async function connectRedis() {
  if (!process.env.REDIS_URL) return;
  try {
    client = createClient({ url: process.env.REDIS_URL });
    client.on('error', () => { connected = false; });
    await client.connect(); connected = true;
    console.log('Redis connected');
  } catch { console.log('Redis unavailable — using in-memory cache fallback'); client = null; }
}
const memory = new Map<string, { value: string; expires: number }>();
export async function getCache(key: string): Promise<string | null> {
  if (client && connected) return client.get(key);
  const item = memory.get(key); if (!item || item.expires < Date.now()) { memory.delete(key); return null; } return item.value;
}
export async function setCache(key: string, value: unknown, seconds = 60) {
  if (client && connected) { await client.set(key, JSON.stringify(value), { EX: seconds }); return; }
  memory.set(key, { value: JSON.stringify(value), expires: Date.now() + seconds * 1000 });
}
export async function invalidateCache(prefix: string) {
  if (client && connected) { const keys = await client.keys(`${prefix}*`); if (keys.length) await client.del(keys); }
  [...memory.keys()].filter(key => key.startsWith(prefix)).forEach(key => memory.delete(key));
}
export const cacheStatus = () => connected ? 'connected' : 'fallback';
