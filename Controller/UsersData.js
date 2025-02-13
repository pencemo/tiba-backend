import { User } from "../db/Model.js";

const allUsers = async(req, res)=> {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10; 
    try{
        const users = await User.find({role: "user"}).select(["-password", "-verificationCode", "-codeExpires"]).sort({ createdAt: -1 }).limit(limit).skip((page - 1) * limit);
        const totalUsers = await User.countDocuments({role: "user"});
        const totalPages = Math.ceil(totalUsers / limit);

        if(page > totalPages){
            return res.status(404).json({success: false, message: "Page not found"});
        }
        if(!users){
            return res.status(404).json({success: false, message: "No users found"});
        }
        return res.status(200).json({success: true, data: users, totalPages, currentPage: page, totalUsers });
        
        
    }catch(err){
        return res.status(500).json({success: false, message: "Internal server error"});
    }
}

const toggleUserStatus = async(req, res)=> {
    const userId = req.body.toggleUser;
    try{
        const users = await User.findOneAndUpdate({_id: userId}, { $set: { status: !req.body.status }});

        
        if(!users){
            return res.status(404).json({success: false, message: "No users found"});
        }
        return res.status(200).json({success: true, message: 'User status updated successfully',});
        
        
    }catch(err){
        return res.status(500).json({success: false, message: "Internal server error"});
    }
}

export { allUsers, toggleUserStatus };