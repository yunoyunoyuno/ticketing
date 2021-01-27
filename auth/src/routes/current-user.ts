import express from 'express';
import {currentUser } from '@yn-tickets/common'

const router = express.Router();

router.get('/api/v0.0.1/users/currentuser',currentUser, async (req, res) => {
  res.send({currentUser : req.currentUser });
  
});

export { router as currentuserRouter}