import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose'
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';



it('returns a 404 if the provided id does not exist', async () => {
  
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app).put(`/api/v0.0.1/tickets/${id}`).set('Cookie', global.signin()).send({
    title: 'asdsadsads',
    price: 20
  }).expect(404);

});

it('returns a 401 if the user is not authenticated', async () => {
  
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app).put(`/api/v0.0.1/tickets/${id}`).send({
    title: 'asdsadsads',
    price: 20
  }).expect(401);

});

it('returns a 401 if the user does not own a ticket', async () => {
  
  const response = await request(app).post('/api/v0.0.1/tickets').set('Cookie', global.signin()).send({
    title: 'asdsad', price: 1000
  });

  await request(app).put(`/api/v0.0.1/tickets/${response.body.id}`).set('Cookie', global.signin()).send({
    title: 'asdsadsad',
    price: 20
  }).expect(401);

});

it('returns a 400 if user provides an invalid title or price', async () => {

  const cookie = global.signin();
  
  const response = await request(app).post('/api/v0.0.1/tickets').set('Cookie', cookie).send({
    title: 'asdsad', price: 1000
  });

  await request(app).put(`/api/v0.0.1/tickets/${response.body.id}`).set('Cookie', cookie).send({
    title: '',
    price : 20
  }).expect(400)

  await request(app).put(`/api/v0.0.1/tickets/${response.body.id}`).set('Cookie', cookie).send({
    title: 'asdasd',
    price : -20
  }).expect(400)

});

it('update the ticket provided valid input', async () => {
  
  const cookie = global.signin();
  
  const response = await request(app).post('/api/v0.0.1/tickets').set('Cookie', cookie).send({
    title: 'asdsad', price: 1000
  });

  await request(app).put(`/api/v0.0.1/tickets/${response.body.id}`).set('Cookie', cookie).send({
    title: 'new title',
    price: 100
  }).expect(200);

  const ticketResponse = await request(app).get(`/api/v0.0.1/tickets/${response.body.id}`).send();

  expect(ticketResponse.body.title).toEqual('new title');
  expect(ticketResponse.body.price).toEqual(100);

});

it('publish an event', async () => {
  
  const cookie = global.signin();
  
  const response = await request(app).post('/api/v0.0.1/tickets').set('Cookie', cookie).send({
    title: 'asdsad', price: 1000
  });

  await request(app).put(`/api/v0.0.1/tickets/${response.body.id}`).set('Cookie', cookie).send({
    title: 'new title',
    price: 100
  }).expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

});

it('rejects updates if the ticket has been reserved', async () => {

  const cookie = global.signin();
  
  const response = await request(app).post('/api/v0.0.1/tickets').set('Cookie', cookie).send({
    title: 'asdsad', price: 1000
  });

  const ticket = await Ticket.findById(response.body.id);
  ticket?.set({ orderId: mongoose.Types.ObjectId().toHexString() });
  await ticket?.save();

  await request(app).put(`/api/v0.0.1/tickets/${response.body.id}`).set('Cookie', cookie).send({
    title: 'new title',
    price: 100
  }).expect(400);
  
})