import { PaymentCreatedEvent, Publisher, Subjects } from "@yn-tickets/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent>{
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}