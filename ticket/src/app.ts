import express from 'express';
import cookieSession from 'cookie-session'
import { errorHandler, NotFoundError, currentUser } from '@yn-tickets/common';

import { showTicketRouter } from './routes/show';
import { createTicketRouter } from './routes/new';
import { indexTickets } from './routes/index';
import { updateTicketRouter } from './routes/update';



const app = express();
app.use(express.json());
app.set('trust proxy',true)
app.use(cookieSession({
  signed: false,
  secure: false
}))

app.use(currentUser);
app.use(createTicketRouter);
app.use(indexTickets);
app.use(showTicketRouter);
app.use(updateTicketRouter);


app.all('*', () => {
  throw new NotFoundError()
})

app.use(errorHandler);

export {app}