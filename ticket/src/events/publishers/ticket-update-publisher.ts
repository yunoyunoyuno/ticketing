import { Publisher, Subjects, TicketUpdatedEvent } from '@yn-tickets/common';

export class TicketUpdatePublisher extends Publisher<TicketUpdatedEvent>{
   subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}