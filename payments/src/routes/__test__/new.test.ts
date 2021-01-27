import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { Order } from '../../models/orders';
import { OrderStatus } from '@yn-tickets/common';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payments';

//jest.mock('../../stripe');

it('returns a 404 when purchasing an order that does not exist', async () => {

  await request(app).post('/api/v0.0.1/payments').set('Cookie', global.signin()).send({
    token: 'asdsada',
    orderId: mongoose.Types.ObjectId().toHexString()
  }).expect(404);

});

it('returns a 401 when purchasing an order that does not belong to the user', async () => {
  
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 20,
    status : OrderStatus.Created
  });

  await order.save();

  await request(app).post('/api/v0.0.1/payments').set('Cookie', global.signin()).send({
    token: 'asdsada',
    orderId: order.id
  }).expect(401);

});

it('returns a 400 when purchasing a cancelled order', async () => {
  
  const userId = mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId: userId,
    version: 0,
    price: 20,
    status : OrderStatus.Cancelled
  });

  await order.save();

  await request(app).post('/api/v0.0.1/payments')
    .set('Cookie', global.signin(userId))
    .send({ orderId: order.id, token: 'asdsad' })
    .expect(400);

});

it('returns a 201 with a valid input', async () => {
  
  const userId = mongoose.Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 100000);

  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price,
    status: OrderStatus.Created
  });
  await order.save();

  await request(app).post('/api/v0.0.1/payments')
    .set('Cookie', global.signin(userId))
    .send({ orderId: order.id, token: 'tok_visa' })
    .expect(201);
  
  // ListAllCharges Features
  const stripeCharges = await stripe.charges.list({ limit: 50 });
  const stripeCharge = stripeCharges.data.find(charge => charge.amount === price * 100);

  expect(stripeCharge).toBeDefined();
  expect(stripeCharge!.currency).toEqual('usd');


  const payment = await Payment.findOne({
    orderId: order._id,
    stripeId : stripeCharge!.id
  });

  expect(payment).not.toBeNull();
  

});

