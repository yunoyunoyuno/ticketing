import { NotAuthorizeError, NotFoundError, requireAuth } from '@yn-tickets/common';
import express, { NextFunction, Request, Response } from 'express';
import { Order } from '../models/order';

const router = express.Router();

router.get('/api/v0.0.1/orders/:orderId',
  requireAuth,
  async (req: Request, res: Response,next : NextFunction) => {
   
    const order = await Order.findById(req.params.orderId).populate('ticket');
    if (!order) return next(new NotFoundError());

    if (order.userId !== req.currentUser!.id) return next(new NotAuthorizeError());
    
    return res.send(order);
});

export { router as showOrderRouter };