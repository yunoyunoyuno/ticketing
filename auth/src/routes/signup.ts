import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { body } from 'express-validator'
import { User } from '../models/users' 
import { BadRequestError,validateRequest } from '@yn-tickets/common'


const router = express.Router();

router.post('/api/v0.0.1/users/signup',
  [
  body('email').isEmail().withMessage("Email is not well structured ..."),
  body('password').trim().isLength({min: 4,max: 20}).withMessage('Password must be between 4 and 20 characters')
  ],
  validateRequest,async (req: Request, res: Response) => {
    
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new BadRequestError('Email in use, Please use login instead.')
    }

    const user = User.build({ email, password });
    await user.save();

    const userJwt = jwt.sign({
      id: user.id,
      email: user.email
    }, process.env.JWT_KEY!)
    
    // Store it on session object
    req.session = {jwt : userJwt}

    res.status(201).send(user);
    
});

export { router as signupRouter}