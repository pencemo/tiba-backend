import express from 'express';
import { authUserMiddleware } from '../Middleware/authMiddleWare.js';
import { userAllData } from '../Controller/UserController.js';
const userRoute = express.Router();

userRoute.get('/user-data', authUserMiddleware, userAllData)


export default userRoute;