// tests/profile.unit.test.ts
import request from 'supertest';
import express from 'express';
import profileRouter from '../src/routes/user';
import bcrypt from 'bcrypt';

const mockDB: Record<string, any> = {};

jest.mock('../src/firebase', () => ({
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn((id?: string) => ({
        get: jest.fn(() => {
          if (id && mockDB[id]) {
            return Promise.resolve({ exists: true, data: () => mockDB[id] });
          }
          return Promise.resolve({ exists: false });
        }),
        delete: jest.fn(() => {
          delete mockDB[id!];
          return Promise.resolve();
        }),
      })),
      add: jest.fn((data: any) => {
        const newId = `mockUser_${Date.now()}`;
        mockDB[newId] = data;
        return Promise.resolve({ id: newId });
      }),
      get: jest.fn(() => ({
        docs: Object.entries(mockDB).map(([id, data]) => ({
          id,
          data: () => data,
        })),
      })),
    })),
  },
}));

const app = express();
app.use(express.json());
app.use('/profiles', profileRouter);

describe('Profile Routes (Unit - Mock Firebase)', () => {
  let createdUserId: string;

  it('POST /profiles creates a profile', async () => {
    const res = await request(app).post('/profiles').send({
      userName: 'New User',
      email: 'new@example.com',
      password: 'secret123',
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('userId');
    createdUserId = res.body.userId;
  });

  it('GET /profiles/:userId returns the created profile', async () => {
    const res = await request(app).get(`/profiles/${createdUserId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('userName', 'New User');
    expect(res.body).toHaveProperty('email', 'new@example.com');
  });

  it('stored password is hashed', async () => {
    const stored = mockDB[createdUserId];
    expect(await bcrypt.compare('secret123', stored.password)).toBe(true);
  });

  it('GET /profiles/:userId password is hidden', async () => {
    const res = await request(app).get(`/profiles/${createdUserId}`);
    expect(res.status).toBe(200);
    expect(res.body).not.toHaveProperty('password');
  });

  it('GET /profiles lists all profiles', async () => {
    const res = await request(app).get('/profiles');
    expect(res.status).toBe(200);
    expect(res.body.some((p: any) => p.email === 'new@example.com')).toBe(true);
  });
});
