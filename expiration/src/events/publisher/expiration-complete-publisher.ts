import {  ExpirationCompleteEvent, Publisher, Subjects } from "@yn-tickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent>{
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}