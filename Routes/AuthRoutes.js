import express from 'express';
import { createUser, logOut, loging, verifyUser, isOuth } from '../Controller/AuthController.js'; // Import the controller functions
import { authUserMiddleware } from '../Middleware/authMiddleWare.js'; // Import the middleware function
const router = express.Router(); 


router.post('/login', loging)
router.post('/is-outh', isOuth)
router.post('/create', createUser)
router.post('/logout', authUserMiddleware, logOut)
router.post('/verify-user', authUserMiddleware, verifyUser)

export {router};