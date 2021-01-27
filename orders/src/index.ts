import mongoose from "mongoose"
import { DatabaseConnectionError } from '@yn-tickets/common';
import { app } from './app'
import { natsWrapper } from "./nats-wrapper";
import { TicketCreatedListener } from "./events/listener/ticket-create-listener";
import { TicketUpdatedListener } from "./events/listener/ticket-updated-listener";
import { ExpirationCompleteListener } from "./events/listener/expiration-complete-listener";
import { PaymentCreatedListener } from "./events/listener/payment-created-listener";

const start = async () => {

  console.log("Starting ... [Orders]");

  
  if (!process.env.JWT_KEY) throw new Error("JWT_KEY must be given :( ")
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI must be defined")
  if (!process.env.NATS_CLIENT_ID) throw new Error("NATS_CLIENT_ID must be given :( ")
  if (!process.env.NATS_URL) throw new Error("NATS_URL must be defined")
  if (!process.env.NATS_CLUSTER_ID) throw new Error("NATS_CLUSTER_ID must be given :( ")

  try {

    await natsWrapper.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_CLIENT_ID, process.env.NATS_URL);
    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed !');
      process.exit();
    });

    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    new TicketCreatedListener(natsWrapper.client).listen();
    new TicketUpdatedListener(natsWrapper.client).listen();
    new ExpirationCompleteListener(natsWrapper.client).listen();
    new PaymentCreatedListener(natsWrapper.client).listen();

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    });
    console.log("Connecting to DB [Orders] ... ")

  } catch (err) {
    throw new DatabaseConnectionError();
  }

  app.listen(3000, () => {
    console.log('Listening on port 3000!! [Orders]')
  })

}

start();
