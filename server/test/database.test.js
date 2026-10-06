import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';

process.env.DB_PATH = ':memory:';
process.env.JWT_SECRET = 'test-only-secret';

const { default: connectDB } = await import('../config/db.js');
const { default: User } = await import('../models/User.js');
const { default: Company } = await import('../models/Company.js');
const { default: Resource } = await import('../models/Resource.js');
const { default: authRoutes } = await import('../routes/authRoutes.js');
const { default: companyRoutes } = await import('../routes/companyRoutes.js');
const { default: resourceRoutes } = await import('../routes/resourceRoutes.js');
const { default: userRoutes } = await import('../routes/userRoutes.js');

connectDB();

test('SQLite persists users, profile metrics, company ownership, and resources', () => {
  const user = User.create({
    name: 'Test Student',
    email: 'student@example.com',
    passwordHash: 'hashed-password',
  });

  assert.equal(User.findByEmail('STUDENT@example.com')._id, user._id);
  const updatedUser = User.updateProfile(user._id, {
    codingBelts: { java: 3 },
    attendance: { yearly: 92 },
    communicationScore: 8.5,
  });
  assert.deepEqual(updatedUser.codingBelts, {
    java: 3,
    cpp: 0,
    python: 0,
    javascript: 0,
  });
  assert.deepEqual(updatedUser.attendance, { quarterly: 0, yearly: 92 });
  assert.equal(updatedUser.communicationScore, 8.5);

  const company = Company.create({
    userId: user._id,
    name: 'Example Corp',
    role: 'Engineer',
    status: 'Applied',
    appliedDate: new Date('2026-01-01T00:00:00.000Z'),
  });
  assert.equal(Company.findByUserId(user._id)[0]._id, company._id);
  assert.deepEqual(Company.findByUserId(-1), []);
  assert.equal(Company.update(company._id, { status: 'Selected' }).status, 'Selected');
  assert.equal(Company.delete(company._id), true);

  const resource = Resource.create({
    title: 'Algorithms',
    category: 'DSA',
    link: 'https://example.com',
  });
  assert.equal(Resource.findAll()[0]._id, resource._id);
  assert.equal(Resource.delete(resource._id), true);
});

test('API registers a user and serves authenticated SQLite-backed requests', async (t) => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/companies', companyRoutes);
  app.use('/api/resources', resourceRoutes);
  app.use('/api/users', userRoutes);

  const server = app.listen(0);
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));
  await new Promise((resolve) => server.once('listening', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}/api`;
  const request = (url, options = {}) => fetch(`${baseUrl}${url}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  });

  const registration = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'API Student',
      email: 'api-student@example.com',
      password: 'password123',
    }),
  });
  assert.equal(registration.status, 201);
  const account = await registration.json();
  const authorization = { Authorization: `Bearer ${account.token}` };

  const loginResponse = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'api-student@example.com',
      password: 'password123',
    }),
  });
  assert.equal(loginResponse.status, 200);

  const applicationResponse = await request('/companies', {
    method: 'POST',
    headers: authorization,
    body: JSON.stringify({ name: 'Example Corp', role: 'Engineer' }),
  });
  assert.equal(applicationResponse.status, 200);
  const application = await applicationResponse.json();
  assert.equal(application.userId, account._id);

  const updateApplicationResponse = await request(`/companies/${application._id}`, {
    method: 'PUT',
    headers: authorization,
    body: JSON.stringify({ status: 'Technical Interview' }),
  });
  assert.equal(updateApplicationResponse.status, 200);
  assert.equal((await updateApplicationResponse.json()).status, 'Technical Interview');

  const profileResponse = await request('/users/profile', {
    method: 'PUT',
    headers: authorization,
    body: JSON.stringify({ codingBelts: { java: 2 } }),
  });
  assert.equal(profileResponse.status, 200);
  assert.equal((await profileResponse.json()).codingBelts.java, 2);

  const resourcesResponse = await request('/resources', { headers: authorization });
  assert.equal(resourcesResponse.status, 200);
  assert.deepEqual(await resourcesResponse.json(), []);

  const createResourceResponse = await request('/resources', {
    method: 'POST',
    headers: authorization,
    body: JSON.stringify({
      title: 'Practice problems',
      category: 'DSA',
      link: 'https://example.com/problems',
    }),
  });
  assert.equal(createResourceResponse.status, 200);
  const resource = await createResourceResponse.json();

  const deleteResourceResponse = await request(`/resources/${resource._id}`, {
    method: 'DELETE',
    headers: authorization,
  });
  assert.equal(deleteResourceResponse.status, 200);

  const deleteApplicationResponse = await request(`/companies/${application._id}`, {
    method: 'DELETE',
    headers: authorization,
  });
  assert.equal(deleteApplicationResponse.status, 200);
});
