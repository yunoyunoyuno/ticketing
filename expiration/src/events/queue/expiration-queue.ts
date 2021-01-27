import Queue from 'bull';
import { natsWrapper } from '../../nats-wrapper';
import { ExpirationCompletePublisher } from '../publisher/expiration-complete-publisher';

interface Payload {
  orderId: string
}

// enqueue a job
const expirationQueue = new Queue<Payload>('order:expiration', {
  redis: {
    host: process.env.REDIS_HOST
  }
});


// process a job

expirationQueue.process(async (job) => {
  new ExpirationCompletePublisher(natsWrapper.client).publish({
    orderId : job.data.orderId
  })
});

export { expirationQueue };