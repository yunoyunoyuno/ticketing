import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { body} from 'express-validator'
import { validateRequest,BadRequestError } from '@yn-tickets/common'
import { User } from '../models/users'
import {Password } from '../services/password'

const router = express.Router();

router.post('/api/v0.0.1/users/signin',
  [
  body('email').isEmail().withMessage("Email is not well structured ..."),
  body('password').trim().notEmpty().withMessage("Password please.")
  ],
  validateRequest
  , async (req: Request, res: Response) => {
    
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (!existingUser) 
      throw new BadRequestError('Invalid Credential');
    
    const passwordMatch = await Password.compare(existingUser.password, password);

    if (!passwordMatch) {
      throw new BadRequestError('Invalid Credential');
    }

    const userJwt = jwt.sign({
      id: existingUser.id,
      email: existingUser.email
    }, process.env.JWT_KEY!)
    
    // Store it on session object
    req.session = {jwt : userJwt}

    res.status(200).send(existingUser)   
    
  
});

export { router as signinRouter}