import dotenv from "dotenv";
import { Booking, User } from "../db/Model.js";
import { notification } from "./NotifictionController.js";
dotenv.config();
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); 

const crateBooking = async (req, res) => {
  const {
    name,
    email,
    contact,
    userId,
    carId,
    showroomId,
    totalCost,
    date,
    paymentIntentId, // Include this
  } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({ success: false, message: "Payment not confirmed." });
    }

    const booking = new Booking({
      name,
      email,
      contact,
      userId,
      carId,
      showroomId,
      totalCost,
      date,
      payment: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100, // back to AED
        currency: paymentIntent.currency,
      },
    });

    await booking.save();

    res.status(200).json({ success: true, booking });
  } catch (err) {
    console.error("Booking save error:", err);
    res.status(500).json({ success: false, message: "Booking failed." });
  }
};

const payments = async (req, res) => {
  try {
    const { count, starting_after, ending_before} = req.query;
    const payments = await stripe.paymentIntents.list({
      limit: count, 
      ...(starting_after && { starting_after }),
      ...(ending_before && { ending_before }),
    });

    res.status(200).json({ success: true, payments: payments });
  } catch (err) {
    console.error("Error fetching payments:", err);
    res.status(500).json({ success: false, message: "Failed to retrieve payments" });
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

export { payments, allBookings, changeStatus, dateCheck, crateBooking };
