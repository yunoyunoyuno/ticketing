import express, { Request, Response } from 'express';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.get('/api/v0.0.1/tickets', async (req: Request, res: Response) => {
  
  const tickets = await Ticket.find({
    orderId : undefined
  })
  res.send(tickets);

});


export {router as indexTickets}