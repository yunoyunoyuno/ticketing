import { Listener, OrderCancelledEvent, Subjects } from "@yn-tickets/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";
import { TicketUpdatePublisher } from "../publishers/ticket-update-publisher";
import { queueGroupName } from "./queue-group-name";

export class OrderCancelledListener extends Listener<OrderCancelledEvent>{
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    
    const ticket = await Ticket.findById(data.ticket.id);

    if (!ticket) throw new Error('ticket not found !');
    
    ticket.set({ orderId: undefined });

    await ticket.save();
    await new TicketUpdatePublisher(this.client).publish({
      id: ticket.id,
      orderId: ticket.orderId,
      userId: ticket.userId,
      price: ticket.price,
      title: ticket.title,
      version : ticket.version
    })

    msg.ack();
  }
}