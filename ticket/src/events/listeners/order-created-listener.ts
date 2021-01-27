import { Listener, OrderCreatedEvent, Subjects } from "@yn-tickets/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { TicketUpdatePublisher } from "../publishers/ticket-update-publisher";
import { queueGroupName } from './queue-group-name';

export class orderCreatedListener extends Listener <OrderCreatedEvent>{
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;
  
  async onMessage(data : OrderCreatedEvent['data'], msg : Message) {
    // Find the ticket that the order is reserving
    const ticket = await Ticket.findById(data.ticket.id);

    // If no ticket, throw error
    if(!ticket) throw new Error('Ticket not found')

    // Mark the ticket as being reserved by setting it's orderId property
    ticket.set({ orderId: data.id });

    // Save the ticket
    await ticket.save();
    await new TicketUpdatePublisher(this.client).publish({
      id: ticket.id,
      price: ticket.price,
      userId: ticket.userId,
      orderId: ticket.orderId,
      version: ticket.version,
      title: ticket.title
    });

    // ack the message
    msg.ack();
  }
}
