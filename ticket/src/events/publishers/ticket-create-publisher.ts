import { Publisher, Subjects, TicketCreatedEvent } from '@yn-tickets/common';

export class TicketCreatePublisher extends Publisher<TicketCreatedEvent>{
   subject: Subjects.TicketCreated = Subjects.TicketCreated;
}