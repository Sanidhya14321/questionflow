import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());
const errors: string[] = [];
try {
  const url = new URL(process.env.DATABASE_URL || '');
  if (!['postgres:', 'postgresql:'].includes(url.protocol)) throw new Error();
} catch { errors.push('DATABASE_URL must be a PostgreSQL URL.'); }
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) errors.push('JWT_SECRET must contain at least 32 characters.');
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log('Required runtime configuration is valid. Secret values were not printed.');
console.log(`AI provider: ${process.env.GROQ_API_KEY ? 'configured' : 'disabled (optional)'}`);
