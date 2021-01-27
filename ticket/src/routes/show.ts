import express, { Request, Response,NextFunction } from 'express';
import { Ticket } from '../models/ticket';
import { NotFoundError } from '@yn-tickets/common';

const router = express.Router();

router.get('/api/v0.0.1/tickets/:id', async (req: Request, res: Response,next : NextFunction) => {

  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    return next(new NotFoundError());
  }

  return res.send(ticket);
});

export { router as showTicketRouter };