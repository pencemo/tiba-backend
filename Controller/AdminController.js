import { Booking, Cars, User } from "../db/Model.js";
import bcript from "bcryptjs";

const createAdmin = async(req, res)=> {
    const { name, email, password, showroomId } = req.body;
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all fields" });
  }

  // Create new user
  try {
    const user = await User.findOne({ email: email });
    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "Admin already exists" });
    }

    const encryptedPassword = await bcript.hash(password, 10);
    if (!encryptedPassword) return res.status(400).json({ success: false, message: "Error to encript password" });

    const newUser = new User({ name, email, password: encryptedPassword, isVerified: true, isAdmin: true, showroomId, role: 'subadmin' });
    await newUser.save();


    res.status(201).json({
      success: true,
      message: "Admin created successfully",
    });
    
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Error creating user" });
  }
}

const allAdmins = async(req, res)=> {
    try{
        const users = await User.find({role: "subadmin"}).select(["-password", "-verificationCode", "-codeExpires"]).sort({ createdAt: -1 });
        const totalUsers = await User.countDocuments({role: "user"});

        
        if(!users){
            return res.status(404).json({success: false, message: "No users found"});
        }
        return res.status(200).json({success: true, data: users, totalUsers });
        
        
    }catch(err){
        return res.status(500).json({success: false, message: "Internal server error"});
    }
}


const dashboard = async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
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

    const totalUsers =  await User.countDocuments({ role: "user" })  // Only admin can see total users
    const totalBooking = await Booking.countDocuments(bookingFilter); // Apply booking filter
    const totalRev = await Booking.aggregate([
      { $match: bookingFilter }, 
      {
        $group: {
          _id: null, 
          totalAmount: { $sum: "$totalCost" } 
        }
      }
    ]);
    const totalAmount = totalRev[0]?.totalAmount || 0;

    // Calculate this month's bookings
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const thisMonthBooking = await Booking.countDocuments({
      ...bookingFilter, 
      createdAt: {
        $gte: startOfMonth,
        $lt: startOfNextMonth
      }
    });

    const pendingBooking = await Booking.countDocuments({
      ...bookingFilter, 
      status: "pending",
    });

    // Return the response
    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalBooking,
        thisMonthBooking,
        totalAmount: totalAmount,
        pendign: pendingBooking
      }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export { createAdmin, allAdmins, dashboard };