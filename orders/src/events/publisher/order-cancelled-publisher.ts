import { OrderCancelledEvent, Publisher, Subjects } from "@yn-tickets/common";


export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent>{
  subject : Subjects.OrderCancelled = Subjects.OrderCancelled;
}
