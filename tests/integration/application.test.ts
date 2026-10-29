import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';

const url = new URL(process.env.TEST_BASE_URL || 'http://127.0.0.1:3000');
// This suite creates data. It must never run against a public deployment.
if (!['localhost', '127.0.0.1'].includes(url.hostname) || !process.env.DATABASE_URL?.includes('questionflow_test')) {
  throw new Error('Integration tests require localhost and a dedicated questionflow_test database.');
}
const db = new PrismaClient();
const emails: string[] = [];
const assessments: string[] = [];
const users: string[] = [];
before(async () => { await db.rateLimitBucket.deleteMany(); });
after(async () => {
  await db.assessmentResult.deleteMany({ where: { userId: { in: users } } });
  await db.assessmentVote.deleteMany({ where: { userId: { in: users } } });
  await db.assessment.deleteMany({ where: { id: { in: assessments } } });
  await db.user.deleteMany({ where: { email: { in: emails } } });
  await db.$disconnect();
});
async function request(path: string, options: { method?: string; body?: unknown; cookie?: string; origin?: string } = {}) {
  const response = await fetch(new URL(path, url), {
    method: options.method || 'GET', redirect: 'manual',
    headers: { ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(options.cookie ? { Cookie: options.cookie } : {}), ...(options.origin ? { Origin: options.origin } : {}) },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
  const data = await response.json().catch(() => null);
  return { status: response.status, data, location: response.headers.get("location"), cache: response.headers.get("cache-control"), setCookie: response.headers.get("set-cookie"), cookie: response.headers.get('set-cookie')?.split(';')[0] };
}

test('production application: authentication → authoring → voting → server grading → history → logout', async () => {
  assert.equal((await request('/api/health')).status, 200);
  assert.equal((await request('/api/ready')).status, 200);
  assert.equal((await request('/profile')).status, 307);
  assert.equal((await request('/api/admin/stats')).status, 403);
  assert.equal((await request('/api/results')).status, 401);
  for (const path of ['/assessments/web-dev-fundamentals', '/assessments/create']) {
    const anonymous = await request(path);
    assert.equal(anonymous.status, 307);
    assert.equal(new URL(anonymous.location!, url).searchParams.get('next'), path);
    assert.equal((await request(path, { cookie: 'eduassess_session=invalid' })).status, 307);
  }
  assert.equal((await request('/api/assessments/ai', { method: 'POST', body: {} })).status, 401);
  const email = `integration-${randomUUID()}@example.test`; emails.push(email);
  const account = { name: 'Integration Learner', email, password: 'integration-password-123' };
  assert.equal((await request('/api/auth/signup', { method: 'POST', body: account, origin: 'https://attacker.invalid' })).status, 403);
  const signup = await request('/api/auth/signup', { method: 'POST', body: account });
  assert.equal(signup.status, 200); assert.ok(signup.cookie);
  users.push(signup.data.id);
  let cookie = signup.cookie;
  assert.match(signup.setCookie!, /HttpOnly/i);
  assert.match(signup.setCookie!, /Max-Age=604800/i);
  assert.equal((await request('/api/auth/login', { method: 'POST', body: { email, password: 'incorrect' } })).status, 401);
  const login = await request('/api/auth/login', { method: 'POST', body: account });
  assert.equal(login.status, 200); assert.ok(login.cookie); cookie = login.cookie;
  for (let visit = 0; visit < 3; visit++) {
    assert.equal((await request('/profile', { cookie })).status, 200);
    const me = await request('/api/auth/me', { cookie });
    assert.equal(me.data.userId, signup.data.id);
    assert.match(me.cache!, /no-store/);
  }
  for (const path of ['/login', '/signup']) {
    assert.equal(new URL((await request(path, { cookie })).location!, url).pathname, '/profile');
  }
  const returnPath = '/assessments/web-dev-fundamentals';
  assert.equal(new URL((await request(`/login?next=${encodeURIComponent(returnPath)}`, { cookie })).location!, url).pathname, returnPath);
  assert.equal(new URL((await request('/login?next=https://attacker.invalid', { cookie })).location!, url).pathname, '/profile');
  assert.equal((await request('/api/auth/me', { cookie })).data.userId, signup.data.id);
  assert.equal((await request('/api/admin/stats', { cookie })).status, 403);
  assert.equal((await request('/api/results?userId=another-user', { cookie })).status, 403);
  assert.equal((await request('/api/assessments', { method: 'POST', cookie, body: { title: 'x'.repeat(70000) } })).status, 413);
  const quiz = { title: 'Integration assessment', description: 'A dedicated assessment for end to end verification.', category: 'Web Development', questions: [{ id: 'one', questionText: 'Which option is the correct answer?', options: ['Correct', 'Incorrect'], correctAnswer: 'Correct', type: 'multiple-choice' }] };
  assert.equal((await request('/api/assessments', { method: 'POST', cookie, body: { ...quiz, questions: [{ ...quiz.questions[0], correctAnswer: 'missing' }] } })).status, 400);
  const created = await request('/api/assessments', { method: 'POST', cookie, body: quiz });
  assert.equal(created.status, 201); assessments.push(created.data.id);
  const library = await request('/api/assessments', { cookie });
  assert.ok(library.data.every((a: object) => !("questions" in a)));
  assert.ok(library.data.some((a: { id: string }) => a.id === created.data.id));
  assert.equal((await request(`/assessments/${created.data.id}`)).status, 307);
  assert.equal((await request(`/assessments/${created.data.id}`, { cookie })).status, 200);
  const votePath = `/api/assessments/${created.data.id}/vote`;
  assert.equal((await request(votePath, { method: 'POST', cookie, body: { voteType: 'up' } })).data.upvotes, 1);
  assert.equal((await request(votePath, { method: 'POST', cookie, body: { voteType: 'up' } })).data.upvotes, 1);
  const changed = await request(votePath, { method: 'POST', cookie, body: { voteType: 'down' } });
  assert.equal(changed.data.upvotes, 0); assert.equal(changed.data.downvotes, 1);
  const payload = { assessmentId: created.data.id, submissionId: randomUUID(), scorePercentage: 100, userId: 'forged', answers: [{ questionId: 'one', selectedAnswer: 'Incorrect' }] };
  const firstAttempts = await Promise.all(Array.from({ length: 3 }, () => request('/api/results', { method: 'POST', cookie, body: payload })));
  const result = firstAttempts[0];
  assert.ok(firstAttempts.every(r => [200, 201].includes(r.status) && r.data.id === result.data.id));
  assert.equal(result.data.scorePercentage, 0); assert.equal(result.data.userId, signup.data.id);
  const retries = await Promise.all(Array.from({ length: 3 }, () => request('/api/results', { method: 'POST', cookie, body: payload })));
  assert.ok(retries.every(r => r.data.id === result.data.id));
  assert.equal((await request('/api/results', { method: 'POST', cookie, body: { ...payload, answers: [{ questionId: 'one', selectedAnswer: 'Correct' }] } })).status, 409);
  assert.equal((await request('/api/results', { method: 'POST', cookie, body: { ...payload, submissionId: randomUUID(), answers: [{ questionId: 'unknown', selectedAnswer: 'Correct' }] } })).status, 400);
  const history = await request('/api/results', { cookie });
  assert.equal(history.data.length, 1); assert.equal(history.data[0].scorePercentage, 0);
  assert.equal((await request('/api/assessments/ai', { method: 'POST', cookie, body: { topic: 'Algorithms', numberOfQuestions: 3, difficulty: 'medium' } })).status, 503);
  const recommended = await request('/api/recommendations', { method: 'POST', cookie, body: { userHistory: [{ assessmentCategory: 'Web Development', score: 0, interests: 'CS' }], availableAssessments: [{ assessmentCategory: 'Web Development', assessmentTitle: quiz.title }] } });
  assert.equal(recommended.status, 200); assert.deepEqual(recommended.data.recommendations, [quiz.title]);
  const logout = await request('/api/auth/logout', { method: 'POST', cookie });
  assert.equal(logout.status, 200); assert.match(logout.setCookie!, /Max-Age=0/i);
  const loggedOutCookie = logout.cookie!;
  assert.equal((await request('/api/auth/me', { cookie: loggedOutCookie })).status, 401);
  assert.equal((await request('/profile', { cookie: loggedOutCookie })).status, 307);
  assert.equal((await request(`/assessments/${created.data.id}`, { cookie: loggedOutCookie })).status, 307);
  assert.equal((await request('/api/results', { cookie: loggedOutCookie })).status, 401);
  const loginAgain = await request('/api/auth/login', { method: 'POST', body: account });
  assert.equal(loginAgain.status, 200); assert.ok(loginAgain.cookie);
  assert.equal((await request('/profile', { cookie: loginAgain.cookie })).status, 200);
  assert.equal((await request(`/assessments/${created.data.id}`, { cookie: loginAgain.cookie })).status, 200);
  assert.equal((await request('/api/auth/logout', { method: 'POST', cookie: loginAgain.cookie })).status, 200);
  for (let i = 0; i < 10; i++) await request('/api/auth/login', { method: 'POST', body: { email, password: 'incorrect' } });
  assert.equal((await request('/api/auth/login', { method: 'POST', body: account })).status, 429);

});
