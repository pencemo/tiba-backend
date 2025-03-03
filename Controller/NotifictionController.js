import { Notification, User } from "../db/Model.js"

const notification = async (type, isForAdmin, title, message, userId) => {
    
    try {
        const notification = await Notification.create({ type, isForAdmin, title, message, userId })
        return notification
    } catch (error) {
        console.log(error)
    }
}

const newNotification = async (req, res) => {

    try {
        const { id } = req.params
        const { title, body } = req.body
        const notification = await Notification.create({ title, body, userId: id })
        res.status(200).json(notification)
    } catch (error) {
        res.status(500).json(error)
    }
}

const adminNotification = async (req, res) => {
    const {userId}=req.body
    try {
        const user = await User.findById(userId)
        if(!user) return res.status(404).json({success: false, message:"User not found"})

        if(user.role === "admin"){
            const notification = await Notification.find({ isForAdmin: true}).sort({ createdAt: -1 })
            const notificationCount = await Notification.countDocuments({ isForAdmin: true, isRead: false })
            return res
            .status(200)
            .json({ success: true, data: { notification, count: notificationCount } });
        }else if(user.role === "subadmin"){
            const showroomId = user.showroomId 
            // const notification = await Notification.find({isForAdmin:true, userId: showroomId}).sort({ createdAt: -1 })
            const  notificationCount = await Notification.countDocuments({
                isForAdmin: true,
                isRead: false,
                $or: [
                    { type: { $ne: "booking" } }, // Include non-booking types
                    { type: "booking", userId: showroomId } // Include booking types filtered by userId
                ]
            });
            const notification = await Notification.aggregate([
                {
                    $match: {
                        isForAdmin: true,
                        $or: [
                            { type: { $ne: "newBooking" } }, // Include non-newBooking types
                            { type: "newBooking", userId: showroomId } // Include booking types filtered by userId
                        ]
                    }
                  },
                  { $sort: { createdAt: -1 } },
            ])
            // console.log(not);
            return res
            .status(200)
            .json({ success: true, data: { notification, count: notificationCount } });
        }

        
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

const updateStatusofNotific = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: "Invalid or empty IDs array" });
        }

        const result = await Notification.updateMany(
            { _id: { $in: ids } },
            { $set: { isRead: true } }
        );

        return res.status(200).json({ success: true, message: "Notifications updated", result });
    } catch (error) {
        console.error("Error updating notifications:", error);
        return res.status(500).json({ error: error.message });
    }
};

export {
    notification,
    newNotification,
    adminNotification,
    updateStatusofNotific
}