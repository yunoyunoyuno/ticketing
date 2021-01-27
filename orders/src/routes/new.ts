import express, { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { BadRequestError, NotFoundError,OrderStatus,requireAuth, validateRequest } from '@yn-tickets/common';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
import { OrderCreatedPublisher } from '../events/publisher/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();
const EXPIRATION_WINDOW_SECONDS = 5 * 60;

router.post('/api/v0.0.1/orders',
  requireAuth,  [
  body('ticketId')
    .not()
    .isEmpty()
    .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
    .withMessage('TicketId must be provided !')
  ], validateRequest,
    async (req: Request, res: Response,next : NextFunction) => {
    
      const { ticketId } = req.body;

      // Find the ticket the user is trying to order in the database.
      
      const ticket = await Ticket.findById(ticketId);
      if (!ticket) return next(new NotFoundError());
      
      // Make sure that the ticket is not already reserved.
      
      const isReserved = await ticket.isReserved();
      if (isReserved) return next(new BadRequestError('Ticket is already reserved !'));
      
      // Calculate an expiration date of this order.

      const expiration = new Date();
      expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);
      
      // Build the order and save it to the database.

      const order = Order.build({
        userId: req.currentUser!.id,
        status: OrderStatus.Created,
        expiresAt: expiration,
        ticket: ticket
      });
      await order.save();

      new OrderCreatedPublisher(natsWrapper.client).publish({
        id: order.id,
        version : order.version,
        status: order.status,
        userId: order.userId,
        expiresAt: order.expiresAt.toISOString(),
        ticket: {
          id: ticket.id,
          price: ticket.price
        }
      })
      
      // Publish an event saying that an order was created.

      res.status(201).send(order);
});

export { router as newOrderRouter };