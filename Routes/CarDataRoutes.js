import express from "express";
import { addCars, allCars, deleteCar } from "../Controller/CarController.js";
import { authUserMiddleware } from "../Middleware/authMiddleWare.js";

const carRoute = express.Router();

carRoute.post('/create',authUserMiddleware, addCars)
carRoute.get('/all-cars', allCars)
carRoute.post('/delete',authUserMiddleware, deleteCar)

export {carRoute};