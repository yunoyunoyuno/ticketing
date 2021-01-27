import express from 'express';
import 'express-async-errors'
import cookieSession from 'cookie-session'

import { currentuserRouter } from './routes/current-user'
import { signinRouter} from './routes/signin'
import { signoutRouter} from './routes/signout'
import { signupRouter } from './routes/signup'
import { errorHandler,NotFoundError } from '@yn-tickets/common'



const app = express();
app.use(express.json());
app.set('trust proxy',true)
app.use(cookieSession({
  signed: false,
  secure: process.env.NODE_ENV !== 'test'
}))

app.use(currentuserRouter);
app.use(signinRouter)
app.use(signoutRouter)
app.use(signupRouter);

app.all('*', () => {
  throw new NotFoundError()
})

app.use(errorHandler);

export {app}