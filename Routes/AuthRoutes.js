import express from 'express';
import { createUser, logOut, login, verifyUser, isOuth } from '../Controller/AuthController.js'; // Import the controller functions
import { authUserMiddleware } from '../Middleware/authMiddleWare.js'; // Import the middleware function
const router = express.Router(); 


router.post('/create', createUser)
router.post('/login', login)
router.post('/is-outh',authUserMiddleware, isOuth)
router.post('/logout', authUserMiddleware, logOut)
router.post('/verify-user', authUserMiddleware, verifyUser)

export {router};