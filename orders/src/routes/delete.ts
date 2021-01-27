import { NotAuthorizeError, NotFoundError, OrderStatus, requireAuth } from '@yn-tickets/common';
import express, { NextFunction, Request, Response } from 'express';
import { OrderCancelledPublisher } from '../events/publisher/order-cancelled-publisher';
import { Order } from '../models/order';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.delete('/api/v0.0.1/orders/:orderId',
  requireAuth,
  async (req: Request, res: Response,next:NextFunction) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) return next(new NotFoundError());

    if (order.userId !== req.currentUser!.id) return next(new NotAuthorizeError());

    order.status = OrderStatus.Cancelled;
    await order.save();

    // publish an event saying this was cancelled.
    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      ticket: {
        id : order.ticket.id
      },
      version : order.version
    })

    res.status(204).send(order);

});

export { router as deleteOrderRouter };