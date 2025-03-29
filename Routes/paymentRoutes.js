import express from 'express';
import { authUserMiddleware } from '../Middleware/authMiddleWare.js';
import { createPayment } from '../Controller/paymentController.js';
const paymentRoute = express.Router();

paymentRoute.post('/create-payment', createPayment )

export default paymentRoute;