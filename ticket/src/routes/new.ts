import { requireAuth,validateRequest } from '@yn-tickets/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { version } from 'node-nats-streaming';
import { TicketCreatePublisher } from '../events/publishers/ticket-create-publisher';

import { Ticket } from '../models/ticket';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post('/api/v0.0.1/tickets', requireAuth,
  [
  body('title').not().isEmpty().withMessage('Title is required'),
  body('price').isFloat({gt : 0}).withMessage('Price must be greater than 0')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    
    const { title, price } = req.body;
    const ticket = Ticket.build({ title, price, userId: req.currentUser!.id });

    await ticket.save();
    
    await new TicketCreatePublisher(natsWrapper.client).publish({
      id: ticket.id,
      version : ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId
    });

    res.status(201).send(ticket);
    
});

export { router as createTicketRouter};