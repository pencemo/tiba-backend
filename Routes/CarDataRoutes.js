import express from "express";
import { addCars, allCars, allCarsUser, changeStatus, deleteCar, editCar, oneCar } from "../Controller/CarController.js";
import { authUserMiddleware } from "../Middleware/authMiddleWare.js";
import { uploadFiles } from "../Controller/FileController.js";
import { upload } from "../Middleware/uploadMidd.js";

const carRoute = express.Router();

carRoute.post('/create', authUserMiddleware, upload.array('files', 5), addCars)
carRoute.get('/all-cars', authUserMiddleware, allCars)
carRoute.get('/all-cars-user', allCarsUser)
carRoute.get('/oneCar', oneCar)
carRoute.post('/delete',authUserMiddleware, deleteCar)
carRoute.post('/edit-car',authUserMiddleware, upload.array('files', 5), editCar)
carRoute.post('/chageStatus',authUserMiddleware, changeStatus)
carRoute.post('/image', upload.array('files', 5), uploadFiles)

export {carRoute}; 