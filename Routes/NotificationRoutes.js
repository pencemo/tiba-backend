import express from 'express';
import { adminNotification, updateStatusofNotific } from '../Controller/NotifictionController.js';
import { authUserMiddleware } from '../Middleware/authMiddleWare.js';
const notificationRoute = express.Router();

notificationRoute.get('/admin-notification', authUserMiddleware, adminNotification)
notificationRoute.post('/make-us-read', authUserMiddleware, updateStatusofNotific)


export default notificationRoute;