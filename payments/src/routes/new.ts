import { BadRequestError, NotAuthorizeError, NotFoundError, OrderStatus, requireAuth, validateRequest } from '@yn-tickets/common';
import { body } from 'express-validator';
import express, { NextFunction, Request,Response }from 'express';
import { Order } from '../models/orders';
import { stripe } from '../stripe';
import { Payment } from '../models/payments';
import { PaymentCreatedPublisher } from '../events/publisher/payment-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post('/api/v0.0.1/payments',
  requireAuth,
  [
    body('token').not().isEmpty(),
    body('orderId').not().isEmpty()
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) return next(new NotFoundError());
    if (order.userId !== req.currentUser!.id) return next(new NotAuthorizeError());
    if (order.status === OrderStatus.Cancelled) return next(new BadRequestError('This is cancelled order'));

    try {

      const charge = await stripe.charges.create({
        currency: 'usd',
        amount: order.price * 100,
        source: token
      });

      const payment = Payment.build({
        orderId,
        stripeId: charge.id
      });

      await payment.save();

      new PaymentCreatedPublisher(natsWrapper.client).publish({
        id: payment.id,
        orderId: payment.orderId,
        stripeId: payment.stripeId
      });

      res.status(201).send({ id : payment.id }); 

    } catch (err) {

      return next(new BadRequestError('Invalid Credential(s)'));
      
    }

    return next(new BadRequestError('Something went very wrong'));

  }
);

export { router as createChargeRouter };