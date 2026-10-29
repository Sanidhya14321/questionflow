// Read-only post-deployment checks; never creates users or assessment data.
const origin = process.env.SMOKE_BASE_URL;
if (!origin) throw new Error('Set SMOKE_BASE_URL to the deployment URL.');
for (const [path, status] of [['/', 200], ['/api/health', 200], ['/api/ready', 200], ['/api/assessments', 200], ['/api/results', 401], ['/api/admin/stats', 403], ['/profile', 307], ['/assessments/web-dev-fundamentals', 307], ['/assessments/create', 307], ['/api/auth/me', 401]]) {
  const response = await fetch(new URL(path, origin), { redirect: 'manual', signal: AbortSignal.timeout(20000) });
  if (response.status !== status) throw new Error(`${path}: expected ${status}, received ${response.status}`);
  if (path === '/api/ready') {
    const ready = await response.json();
    const expected = process.env.EXPECTED_REVISION;
    if (expected && ready.revision !== expected.slice(0, 7)) throw new Error('Deployment serves an unexpected revision.');
  }
  console.log(`PASS ${path}: ${status}`);
}
