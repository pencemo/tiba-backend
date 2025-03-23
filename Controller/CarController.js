import { Cars, User } from "../db/Model.js";
import fs from "fs";
import path from "path";
// add cars
const addCars = async (req, res) => {
  const files = req.files;
  const {
    make, model, year, color, mileage, transmission, fuel_type,
    seats, daily_rate, category, available, showroomId, userId,
    monthly_rate, weekly_rate,
  } = req.body;

  try {
    if (
      !make ||
      !model ||
      !year ||
      !transmission ||
      !fuel_type ||
      !daily_rate ||
      !monthly_rate ||
      !weekly_rate
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill all fields" });
    }

    let images = [];

    if(files){
      images = files.map((file) => `/public/${file.filename}`);
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
      monthly_rate,
      weekly_rate,
      showroomId,
      images,
      available,
      category,
      admin_id: userId,
    });
    await newCar.save();
    res
      .status(201)
      .json({ success: true, message: "Car added successfully", newCar });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Internal server error", err });
  }
};

const editCar = async (req, res) => {
  const { _id, make, model, year, color, mileage,
    transmission, fuel_type, seats, daily_rate,
    monthly_rate, weekly_rate, category, images,
    available, deleteImages } = req.body;
    const {files}= req;
  try {
    
    if ( !make || !model ||
      !year || !transmission ||
      !fuel_type || !daily_rate ||
      !monthly_rate || !weekly_rate ) {

      return res
        .status(400)
        .json({ success: false, message: "Please fill all fields" }); }

        if (deleteImages && deleteImages.length > 0) {
          try {
            const deleteImageFiles = (images) => {
              images.forEach(image => {
                const filePath = path.join('/data', image);
                if (fs.existsSync(filePath)) {
                  fs.unlinkSync(filePath);
                } else {
                  console.log(`File not found: ${filePath}`);
                }
              });
            };
    
            if (typeof deleteImages === 'string') {
              deleteImageFiles([deleteImages]);
            } else {
              deleteImageFiles(deleteImages);
            }
          } catch (err) {
            return res.status(500).json({ success: false, message: "Error deleting images", error: err });
          }
        }
    
    
        let newImages = [];
        try{
          if (files && files.length > 0) {
            const imagesLink = files.map(file => `/public/${file.filename}`);
            if (images) {
              newImages = typeof images === 'string' ? [images, ...imagesLink] : [...images, ...imagesLink];
            }else {
              newImages = imagesLink;
            }
          } else if (images) {
            newImages = typeof images === 'string' ? [images] : images;
          }

        }catch(err){
          return res.status(500).json({ success: false, message: "Error adding images", error: err });
        }

    // const newImages = [...images, ...imagesLink];
    const newObj = {
      make,
      model,
      year,
      color,
      mileage,
      transmission,
      fuel_type,
      seats,
      daily_rate,
      monthly_rate,
      weekly_rate,
      images: newImages,
      available,
      category,
    };

    const newCar = await Cars.findByIdAndUpdate(_id, newObj, { new: true });
    if (!newCar) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }
    res
      .status(201)
      .json({ success: true, message: "Car data edited successfully", newCar });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Internal server error", err });
  }
};

const allCars = async (req, res) => {
  const { userId } = req.body;

  const page = req.query.page || 1;
  const limit = req.query.limit || 10;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    let bookingFilter = {};

    if (user.role === "subadmin") {
      if (!user.showroomId) {
        return res.status(400).json({ success: false, message: "Showroom ID not assigned to subadmin" });
      }
      bookingFilter = { showroomId: user.showroomId }; // Filter bookings by showroomId
    } else if (user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const cars = await Cars.find(bookingFilter)
      .populate({
          path: 'showroomId',
          model: 'showroom',
          select: 'name email'
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);
    const totalCars = await Cars.countDocuments();
    const totalPages = Math.ceil(totalCars / limit);
    if (page > totalPages) {
      return res
        .status(404)
        .json({ success: false, message: "Page not found" });
    }

    if (!cars) {
      return res
        .status(404)
        .json({ success: false, message: "No cars found" });
    }
    return res
      .status(200)
      .json({
        success: true,
        data: cars,
        totalPages,
        currentPage: page,
        totalCars,
      });
    
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const allCarsUser = async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  try {
    const cars = await Cars.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);
    const totalCars = await Cars.countDocuments();
    const totalPages = Math.ceil(totalCars / limit);

    if (page > totalPages) {
      return res
        .status(404)
        .json({ success: false, message: "Page not found" });
    }
    if (!cars) {
      return res.status(404).json({ success: false, message: "No cars found" });
    }
    return res
      .status(200)
      .json({
        success: true,
        data: cars,
        totalPages,
        currentPage: page,
        totalCars,
      });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const oneCar = async (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide car id" });
  }
  try {
    const car = await Cars.findById(id);
    if (!car) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Car found", data: car });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error", err });
  }
};

const deleteCar = async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide car id" });
  }
  try {
    const car = await Cars.findByIdAndDelete(id);
    if (!car) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Car deleted successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error", err });
  }
};

const changeStatus = async (req, res) => {
  const { id, status } = req.body;

  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide car id" });
  }
  try {
    const car = await Cars.findByIdAndUpdate(id, { available: !status });
    if (!car) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }
    return res.status(200).json({ success: true, message: "Car status changed" });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error", err });
  }
}


export { addCars, allCars, deleteCar, oneCar, allCarsUser, editCar, changeStatus };
