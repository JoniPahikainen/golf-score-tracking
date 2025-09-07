import request from 'supertest';
import {app} from '../src/index';

describe('Authentication & User API', () => {
  let authToken: string;
  let userId: string;

  const testUser = {
    userName: 'testuser',
    email: 'test@example.com',
    password: 'password123',
  };

  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(testUser)
      .expect(201);

    expect(response.body).toHaveProperty('userId');
    expect(response.body).toHaveProperty('userName', testUser.userName);
    expect(response.body).toHaveProperty('email', testUser.email);

    userId = response.body.userId;
  });

  it('should not register duplicate email', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(testUser)
      .expect(409);

    expect(response.body).toHaveProperty('error');
  });

  it('should login user with correct credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(200);

    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user.email).toBe(testUser.email);

    authToken = response.body.token;
  });

  it('should reject login with wrong password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'wrongpass' })
      .expect(401);

    expect(response.body).toHaveProperty('error', 'Invalid email or password');
  });

  it('should get the user by ID with valid token', async () => {
    const response = await request(app)
      .get(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('id', userId);
    expect(response.body.data).toHaveProperty('email', testUser.email);
  });

  it('should return 400 for invalid user ID format', async () => {
    const response = await request(app)
      .get('/api/users/invalid-id')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });

  it('should return 404 for non-existent user', async () => {
    const tempUser = {
      userName: 'tempuser',
      email: 'temp@example.com',
      password: 'temppass123',
    };

    const createRes = await request(app)
      .post('/api/auth/register')
      .send(tempUser)
      .expect(201);

    const tempUserId = createRes.body.userId;

    await request(app)
      .delete(`/api/users/id/${tempUserId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    const response = await request(app)
      .get(`/api/users/${tempUserId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);

    expect(response.body).toHaveProperty('error');
  });

  it('should update the user', async () => {
    const newName = 'updatedName';
    const response = await request(app)
      .put(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ userName: newName })
      .expect(200);

    expect(response.body).toHaveProperty('message', 'User updated successfully');
  });

  it('should update the password', async () => {
    const response = await request(app)
      .put(`/api/users/${userId}/password`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ password: 'newpass123' })
      .expect(200);

    expect(response.body).toHaveProperty('message');
  });


  it('should soft-delete the user', async () => {
    const response = await request(app)
      .delete(`/api/users/id/soft/${userId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('message');
  });

  it('should hard-delete the user (permanent)', async () => {
    const response = await request(app)
      .delete(`/api/users/id/${userId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('message');
  });
});
