import request from 'supertest';
import { app } from '../../app';

it('fails when an eamil that does not exist is supplied', async () => {
  await request(app).post('/api/v0.0.1/users/signin')
    .send({ email: 'test@test.com', password: 'password' })
    .expect(400);
});

it('fails when incorrect password supplied', async () => {
  await request(app).post('/api/v0.0.1/users/signup')
    .send({ email: 'test@test.com', password: 'password' })
    .expect(201);
  
    await request(app).post('/api/v0.0.1/users/signin')
    .send({ email: 'test@test.com', password: 'passwor' })
    .expect(400);
});


it('sets a cookie after successful signin', async () => {

  await request(app).post('/api/v0.0.1/users/signup')
    .send({ email: 'test@test.com', password: 'password' }).expect(201);
  
  const response = await request(app).post('/api/v0.0.1/users/signin')
    .send({ email: 'test@test.com', password: 'password' })
    .expect(200);
  
  expect(response.get('Set-Cookie')).toBeDefined()
  
  
});