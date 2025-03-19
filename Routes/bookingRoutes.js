import express from 'express';
import { allBookings, changeStatus, createOrder, dateCheck, payments, verificarion } from '../Controller/bookingController.js';
import { authUserMiddleware } from '../Middleware/authMiddleWare.js';
const bookingRoute = express.Router();

bookingRoute.post('/create-order', createOrder)
bookingRoute.post('/verify-payment',authUserMiddleware, verificarion)
bookingRoute.get('/payments', payments)

bookingRoute.get('/all-bookings', authUserMiddleware, allBookings)
bookingRoute.post('/change-status', authUserMiddleware, changeStatus)

bookingRoute.post('/check-date', dateCheck )

export default bookingRoute;