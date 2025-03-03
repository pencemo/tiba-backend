import express from "express";
import { addCars, allCars, allCarsUser, changeStatus, deleteCar, editCar, oneCar } from "../Controller/CarController.js";
import { authUserMiddleware } from "../Middleware/authMiddleWare.js";

const carRoute = express.Router();

carRoute.post('/create', authUserMiddleware, addCars)
carRoute.get('/all-cars', authUserMiddleware, allCars)
carRoute.get('/all-cars-user', allCarsUser)
carRoute.get('/oneCar', oneCar)
carRoute.post('/delete',authUserMiddleware, deleteCar)
carRoute.post('/edit-car',authUserMiddleware, editCar)
carRoute.post('/chageStatus',authUserMiddleware, changeStatus)

export {carRoute};