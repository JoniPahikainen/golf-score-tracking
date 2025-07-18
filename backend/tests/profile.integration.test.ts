// tests/profile.integration.test.ts
import request from 'supertest';
import express from 'express';
import admin from 'firebase-admin';
import profileRouter from '../src/routes/user'; // your router

const app = express();
app.use(express.json());
app.use('/profiles', profileRouter); 

beforeAll(() => {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(require('../secrets/test-service-account.json')),
    });
  }
});

describe('Profile Routes (Integration - Real Firebase)', () => {
  let userId: string;

  it('POST /profiles creates a real profile', async () => {
    const res = await request(app).post('/profiles').send({
      userName: 'Real User',
      email: 'realuser@example.com',
      password: 'password456',
    });

    console.log('Create response:', res.body); // Debug logging

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('userId');
    userId = res.body.userId;
  });

  it('GET /profiles/:userId returns the real profile', async () => {
    const res = await request(app).get(`/profiles/${userId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('userName', 'Real User');
    expect(res.body).toHaveProperty('email', 'realuser@example.com');
    expect(res.body).not.toHaveProperty('password'); // shouldn't be returned
  });

  it('GET /profiles lists all profiles and includes the new user', async () => {
    const res = await request(app).get('/profiles');
    expect(res.status).toBe(200);
    const found = res.body.some((user: any) => user.id === userId);
    expect(found).toBe(true);
  });

  it('DELETE /profiles/:userId deletes the profile', async () => {
    const res = await request(app).delete(`/profiles/${userId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'User deleted successfully');

    const getRes = await request(app).get(`/profiles/${userId}`);
    expect(getRes.status).toBe(404);
  });
});
