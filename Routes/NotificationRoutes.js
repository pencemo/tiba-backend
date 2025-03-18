import express from 'express';
import { adminNotification, updateStatusofNotific, userNotification } from '../Controller/NotifictionController.js';
import { authUserMiddleware } from '../Middleware/authMiddleWare.js';
const notificationRoute = express.Router();

notificationRoute.get('/admin-notification', authUserMiddleware, adminNotification)
notificationRoute.post('/make-us-read', authUserMiddleware, updateStatusofNotific)

notificationRoute.get('/user-notification', authUserMiddleware, userNotification)


export default notificationRoute;