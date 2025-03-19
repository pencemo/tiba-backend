import mongoose from "mongoose";
import { Booking } from "../db/Model.js";

const userAllData = async (req, res) => {
  const { userId } = req.body;
  const userIdAsObjectId = new mongoose.Types.ObjectId(userId);
  if (!userId) {
    return res
      .status(400)
      .json({ success: false, message: "User Id is required" });
  }

  try {
    const totalBookings = await Booking.countDocuments({ userId })
    const totalBookingAmout = await Booking.aggregate([
      { $match: { userId:userIdAsObjectId } },
      {
        $group: {
          _id: null, // Group all documents into a single group
          totalAmount: { $sum: "$totalCost" } // Sum the totalCost field (works with Decimal128)
        }
      }
    ])
    const upcoming = await Booking.find({userId, 'date.to': { $gt: new Date()},}).sort({ createdAt: -1 }).populate({
      path: "carId",
      model: "cars",
      select: "make model images",
    });
    return res.status(200).json({ success: true, data:{ upcoming, totalBookings, totalBookingAmout: totalBookingAmout[0]?.totalAmount || 0} });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

export { userAllData };
