import express, { Request, Response,NextFunction } from 'express';
import { body } from 'express-validator';
import { validateRequest, NotFoundError, requireAuth, NotAuthorizeError, BadRequestError } from '@yn-tickets/common';
import { Ticket } from '../models/ticket';
import { TicketUpdatePublisher } from '../events/publishers/ticket-update-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.put('/api/v0.0.1/tickets/:id', requireAuth,
  [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price').isFloat({gt : 0}).withMessage('Price must be provided and greather than 0')
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
  
    const ticket = await Ticket.findById(req.params.id);
  
    if (!ticket) return next(new NotFoundError());

    if (ticket.orderId) return next(new BadRequestError('Cannot edit the reserved ticket'));

    if (ticket.userId !== req.currentUser!.id) return next(new NotAuthorizeError());
    
    ticket.set({ title: req.body.title, price: req.body.price });
    await ticket.save();
  
    new TicketUpdatePublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version
    });
  

    return res.send(ticket);


});

export { router as updateTicketRouter };