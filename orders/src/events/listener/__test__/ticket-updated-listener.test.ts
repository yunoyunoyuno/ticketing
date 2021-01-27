import { TicketUpdatedEvent } from "@yn-tickets/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketUpdatedListener } from "../ticket-updated-listener";


const setup = async () => {

  // create an instance of the listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  // create a fake data event
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  });
  await ticket.save();

  // Create a fake data object
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: 'new concert',
    price: 40,
    userId : 'gebrish'
  }

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { msg, data, ticket, listener };
  
};


it('finds, updates, and saves a ticket', async () => {

  const { listener, data, msg, ticket } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);


});

it('acks the message', async () => {
  const { data, listener, msg } = await setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // write assertions to makesure ack function is called.
  expect(msg.ack).toHaveBeenCalled();

});

it('does not call ack if the event has skipped version number', async() => {
  const { msg, data, listener, ticket } = await setup();
  data.version = 0;

  try {
    await listener.onMessage(data, msg);
  } catch (err) {};

  expect(msg.ack).not.toHaveBeenCalled();

})