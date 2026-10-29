import { createHmac } from 'node:crypto';
import { prisma } from './prisma';
import { ApiError } from './api';

/** Database-backed fixed windows remain consistent across serverless instances. */
export async function rateLimit(scope: string, identity: string, limit: number, windowSeconds = 60) {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) throw new Error('Invalid session configuration');
  const now = Date.now();
  const window = Math.floor(now / (windowSeconds * 1000));
  const hash = createHmac('sha256', secret).update(identity).digest('hex');
  const key = `${scope}:${hash}:${window}`;
  const bucket = await prisma.rateLimitBucket.upsert({
    where: { key }, create: { key, expiresAt: new Date((window + 1) * windowSeconds * 1000) },
    update: { count: { increment: 1 } },
  });
  // Bounded retention: delete expired windows on each write.
  await prisma.rateLimitBucket.deleteMany({ where: { expiresAt: { lt: new Date(now - 3600000) } } });
  if (bucket.count > limit) throw new ApiError(429, 'Too many requests. Please try again later.', Math.ceil(((window + 1) * windowSeconds * 1000 - now) / 1000));
}
