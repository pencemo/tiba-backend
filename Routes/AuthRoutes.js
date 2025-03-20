import express from 'express';
import { createUser, logOut, login, verifyUser, isOuth, forgotPassword, changePassword, verityOTP, editProfile } from '../Controller/AuthController.js'; // Import the controller functions
import { authUserMiddleware } from '../Middleware/authMiddleWare.js'; // Import the middleware function
import { upload } from '../Middleware/uploadMidd.js';
const router = express.Router(); 


router.post('/create', createUser)
router.post('/login', login)
router.post('/is-outh',authUserMiddleware, isOuth)
router.post('/logout', authUserMiddleware, logOut)
router.post('/send-otp', forgotPassword)
router.post('/verify-otp', verityOTP)
router.post('/change-password', changePassword)
router.post('/verify-user', authUserMiddleware, verifyUser)
router.post('/edit-profile', authUserMiddleware, upload.single('file'), editProfile)

export {router};