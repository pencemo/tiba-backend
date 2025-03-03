import express from 'express';
import { allUsers, toggleUserStatus } from '../Controller/UsersData.js';
import { authUserMiddleware } from '../Middleware/authMiddleWare.js';
import { adminMiddleware } from '../Middleware/adminMidd.js';
import { addShowroom, allShowroom } from '../Controller/ShowroomController.js';
import { allAdmins, createAdmin, dashboard } from '../Controller/AdminController.js';
const adminRouter = express.Router();

adminRouter.get('/user-list',authUserMiddleware, adminMiddleware, allUsers)
adminRouter.post('/toggle-user-status', authUserMiddleware, adminMiddleware, toggleUserStatus)

// showroom routes
adminRouter.post('/add-showroom', authUserMiddleware, adminMiddleware, addShowroom)
adminRouter.get('/all-showroom', authUserMiddleware, adminMiddleware, allShowroom)

// admin routes
adminRouter.get('/admin-list', authUserMiddleware, adminMiddleware, allAdmins)
adminRouter.post('/create-admin', authUserMiddleware, adminMiddleware, createAdmin)

adminRouter.get('/dashboard', authUserMiddleware, adminMiddleware, dashboard)


export default adminRouter;