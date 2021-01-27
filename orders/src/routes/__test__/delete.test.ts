import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it("marks an order as cancelled", async () => {
 
  // create a ticket with Ticket Model

  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  });

  await ticket.save();

  const user = global.signin();

  // make a request to create an order

  const { body : order } = await request(app).post('/api/v0.0.1/orders').set('Cookie', user)
    .send({ ticketId: ticket.id }).expect(201)

  // make a request to cancel the order

  await request(app).delete(`/api/v0.0.1/orders/${order.id}`).set('Cookie', user).send().expect(204);

  // expectation to make sure the thing is cancelled
  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder?.status).toEqual(OrderStatus.Cancelled);

});

it('emits an order created event', async () => {

  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  });

  await ticket.save();

  const user = global.signin();

  // make a request to create an order

  const { body : order } = await request(app).post('/api/v0.0.1/orders').set('Cookie', user)
    .send({ ticketId: ticket.id }).expect(201)

  // make a request to cancel the order

  await request(app).delete(`/api/v0.0.1/orders/${order.id}`).set('Cookie', user).send().expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled()
  
})