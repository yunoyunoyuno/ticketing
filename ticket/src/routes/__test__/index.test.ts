import request from 'supertest';
import { app } from '../../app';



const createTicket = () => {
  return request(app).post('/api/v0.0.1/tickets').set('Cookie', global.signin()).send({
    title : 'asdasdsd',price : 20
  })
}

it('can fetch a list of a tickets', async () => {
  await createTicket(); await createTicket(); await createTicket();

  const response = await request(app).get('/api/v0.0.1/tickets').send().expect(200);
  expect(response.body.length).toEqual(3);
})