import { Cars } from "../db/Model.js";

// add cars
const addCars = (req, res) => {
    const { make, model, year, color, mileage,transmission,fuel_type,seats, daily_rate,location_id, images,available, admin_id, userId } = req.body;
    try{
        if(!make || !model || !year || !transmission || !fuel_type ||!daily_rate  || !images ){
            return res.status(400).json({success: false, message: "Please fill all fields"})
        }
        
        const newCar = new Cars({
            make,
            model,
            year,
            color,
            mileage,
            transmission,
            fuel_type,
            seats,
            daily_rate,
            location_id: userId,
            images,
            available,
            admin_id : userId
        });
        newCar.save()
        res.status(201).json({success: true, message: "Car added successfully", newCar})
    }catch(err){
        res.status(500).json({success: false, message: "Internal server error", err})
    }
    
}

const allCars = async (req, res) => {
    // try{
    //     const cars = await Cars.find();
    //     return res.status(200).json({success: true, message: "All cars", cars})
    // }catch(err){
    //     return res.status(500).json({success: false, message: "Internal server error", err})
    // }
    const page = req.query.page || 1;
    const limit = req.query.limit || 10; 
    try{
        const users = await Cars.find().sort({ createdAt: -1 }).limit(limit).skip((page - 1) * limit);
        const totalCars = await Cars.countDocuments();
        const totalPages = Math.ceil(totalCars / limit);

        if(page > totalPages){
            return res.status(404).json({success: false, message: "Page not found"});
        }
        if(!users){
            return res.status(404).json({success: false, message: "No cars found"});
        }
        return res.status(200).json({success: true, data: users, totalPages, currentPage: page, totalCars });
        
        
    }catch(err){
        return res.status(500).json({success: false, message: "Internal server error"});
    }
}

const deleteCar = async (req, res) => {
    const { id } = req.body;
    if(!id){
        return res.status(400).json({success: false, message: "Please provide car id"})
    }
    try{
        const car = await Cars.findByIdAndDelete(id);
        if(!car){
            return res.status(404).json({success: false, message: "Car not found"});
        }
        return res.status(200).json({success: true, message: "Car deleted successfully"});
    }catch(err){
        return res.status(500).json({success: false, message: "Internal server error", err});
    }
}

export {
    addCars,allCars, deleteCar
}