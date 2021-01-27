import express from 'express';
import cookieSession from 'cookie-session'
import { errorHandler, NotFoundError, currentUser } from '@yn-tickets/common';

import { deleteOrderRouter } from './routes/delete';
import { showOrderRouter } from './routes/show';
import { newOrderRouter } from './routes/new';
import { indexOrderRouter } from './routes/index';

const app = express();
app.use(express.json());
app.set('trust proxy',true)
app.use(cookieSession({
  signed: false,
  secure: false
}))

app.use(currentUser);

app.use(deleteOrderRouter);
app.use(indexOrderRouter);
app.use(showOrderRouter);
app.use(newOrderRouter);

app.all('*', () => {
  throw new NotFoundError()
})

app.use(errorHandler);

export {app}