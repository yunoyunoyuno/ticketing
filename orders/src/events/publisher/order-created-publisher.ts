import { OrderCreatedEvent, Publisher, Subjects } from "@yn-tickets/common";


export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent>{
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
