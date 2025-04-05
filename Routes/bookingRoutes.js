import express from 'express';
import { allBookings, changeStatus, crateBooking, dateCheck, payments } from '../Controller/bookingController.js';
import { authUserMiddleware } from '../Middleware/authMiddleWare.js';
const bookingRoute = express.Router();

bookingRoute.post('/create',authUserMiddleware, crateBooking)
bookingRoute.get('/payments', payments)

bookingRoute.get('/all-bookings', authUserMiddleware, allBookings)
bookingRoute.post('/change-status', authUserMiddleware, changeStatus)

bookingRoute.post('/check-date', dateCheck )

export default bookingRoute;