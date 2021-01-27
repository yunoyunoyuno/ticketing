import request from 'supertest';
import { app } from '../../app';

it('responds with details about the current user', async () => {

  const cookie = await global.signup();
  
  const response = await request(app).get('/api/v0.0.1/users/currentuser')
    .set('Cookie',cookie).send().expect(200);

  expect(response.body.currentUser.email).toEqual('test@test.com')
});

it('response with null if not authenticated', async () => {
  const response = await request(app).get('/api/v0.0.1/users/currentuser').send().expect(200);
  expect(response.body.currentUser).toEqual(undefined);

})