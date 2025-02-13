import express from 'express';
import { allUsers, toggleUserStatus } from '../Controller/UsersData.js';
import { authUserMiddleware } from '../Middleware/authMiddleWare.js';
import { adminMiddleware } from '../Middleware/adminMidd.js';
const adminRouter = express.Router();

adminRouter.get('/user-list',authUserMiddleware, adminMiddleware, allUsers)
adminRouter.post('/toggle-user-status', authUserMiddleware, adminMiddleware, toggleUserStatus)

export default adminRouter;