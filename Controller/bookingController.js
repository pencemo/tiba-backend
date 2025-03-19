import Razorpay from "razorpay";
import dotenv from "dotenv";
import crypto from "crypto";
import { Booking, User } from "../db/Model.js";
import { notification } from "./NotifictionController.js";
dotenv.config();

const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

const razorpay = new Razorpay({
  key_id,
  key_secret,
});

const createOrder = async (req, res) => {
  const { amount, currency, receipt } = req.body;

  const options = {
    amount: amount * 100, // Razorpay expects amount in paise (e.g., 100 INR = 10000 paise)
    currency,
    receipt,
    payment_capture: 1, // Auto-capture payment
  };

  try {
    const response = await razorpay.orders.create(options);
    if (!response) {
      return res
        .status(500)
        .json({ success: false, message: "Error creating order" });
    }
    res.json({
      id: response.id,
      currency: response.currency,
      amount: response.amount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error creating order" });
  }
};

const verificarion = (req, res) => {

  const { order_id, payment_id, signature, formData } = req.body;

  if (!order_id || !payment_id || !signature) {
    return res.status(400).json({ success: false, message: "Invalid request" });
  }

  const generatedSignature = crypto
    .createHmac("sha256", key_secret)
    .update(order_id + "|" + payment_id)
    .digest("hex");

  if (generatedSignature === signature) {
    if (!formData) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid request" });
    }
    const booking = new Booking({
      ...formData,
      payment_id,
      order_id,
    });
    booking.save();
    notification("newBooking", true, 'Booking Received!', `New Booking has been received from ${formData.name}. Review the details and ensure everything is set.`, formData.showroomId)
    notification("newBooking", false, 'Booking Confirmed!', `Your car rental booking has been successfully confirmed! We’re excited to have you on board`, booking.userId)
    return res
      .status(200)
      .json({ success: true, message: "Payment verified successfully" });
  } else {
    return res
      .status(400)
      .json({ success: false, message: "Invalid signature" });
  }
};

const payments = async (req, res) => {
  try {
    const { count, skip } = req.query;

    // Fetch payments from Razorpay
    const payments = await razorpay.payments.all({
      count: count || 10, // Number of payments to fetch (default: 10)
      skip: skip || 0, // Number of payments to skip (default: 0)
    });
    if (!payments) {
      return res
        .status(500)
        .json({ success: false, message: "Error fetching payments" });
    }
    res.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
};

const allBookings = async (req, res) => {
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
    if (user.role === "admin") {
      const bookings = await Booking.find()
        .populate({
          path: 'userId',
          model: 'users',
          select: 'name email profileImg'
        }) 
        .populate({
          path: 'showroomId',
          model: 'showroom',
          select: 'name email'
        })
        .populate({
          path: 'carId',
          model: 'cars',
          select: 'make model year color'
        })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit);
      const totalBookings = await Booking.countDocuments();
      const totalPages = Math.ceil(totalBookings / limit);
      if (page > totalPages) {
        return res
          .status(404)
          .json({ success: false, message: "Page not found" });
      }

      if (!bookings) {
        return res
          .status(404)
          .json({ success: false, message: "No bookings found" });
      }
      return res
        .status(200)
        .json({
          success: true,
          data: bookings,
          totalPages,
          currentPage: page,
          totalBookings,
        });
    }

    if (user.role === "subadmin") {
      const bookings = await Booking.find({ showroomId: user.showroomId })
        .populate({
          path: 'userId',
          model: 'users',
          select: 'name email profileImg'
        })
        .populate({
          path: 'carId',
          model: 'cars',
          select: 'make model year color'
        })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit);
      const totalBookings = await Booking.countDocuments({
        showroomId: user.showroomId,
      });
      const totalPages = Math.ceil(totalBookings / limit);
      if (page > totalPages) {
        return res
          .status(404)
          .json({ success: false, message: "Page not found" });
      }

      if (!bookings) {
        return res
          .status(404)
          .json({ success: false, message: "No bookings found" });
      }
      return res
        .status(200)
        .json({
          success: true,
          data: bookings,
          totalPages,
          currentPage: page,
          totalBookings,
        });
    }

    if (user.role === "user") {
      const bookings = await Booking.find({ userId: userId })
        .populate({
          path: 'carId',
          model: 'cars',
          // select: 'name email profileImg'
        })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit);
      const totalBookings = await Booking.countDocuments({ userId: userId });
      const totalPages = Math.ceil(totalBookings / limit);
      if (page > totalPages) {
        return res
          .status(404)
          .json({ success: false, message: "Page not found" });
      }

      if (!bookings) {
        return res
          .status(404)
          .json({ success: false, message: "No bookings found" });
      }
      return res
        .status(200)
        .json({
          success: true,
          data: bookings,
          totalPages,
          currentPage: page,
          totalBookings,
        });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const changeStatus = async (req, res) => {
  const { status, id } = req.body;

  const newStatus = status === "pending" ? "confirmed" : 'completed';
  try {
    const booking = await Booking.findById(id);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }
    booking.status = newStatus; 
    await booking.save();
    notification("newBooking", false, 'Status Updated!', `Status of your booking has been updated`, booking.userId)
    return res
      .status(200)
      .json({ success: true, message: "Booking status updated successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

// const Date check
const dateCheck = async (req, res) => {
  const { date, carId } = req.body;
  const { from, to } = date; // Extract from and to dates from the date object

  if(date === undefined){
    return res.status(400).json({
      success: false,
      message: "Please provide date",
    });
  }
  try { 
    const overlappingBookings = await Booking.find({
      carId: carId,
      $or: [
        // Case 1: Existing booking starts before the requested 'to' date and ends after the requested 'from' date
        { "date.from": { $lte: to }, "date.to": { $gte: from } },
      ],
    });

    if (overlappingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: "The car is already booked for the selected date range.",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "The car is available for the selected date range.",
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { createOrder, verificarion, payments, allBookings, changeStatus, dateCheck };
