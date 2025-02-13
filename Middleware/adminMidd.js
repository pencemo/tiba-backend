import { User } from "../db/Model.js";

const adminMiddleware = async (req, res, next) => {
    const {userId} = req.body
    if(!userId){
        return res.status(400).json({message: "userId is required"});
    }
    try{
        const data = await User.findById(userId);
        if(!data){
            return res.status(404).json({success: false, message: "User not found"});
        }
        if(data.role !== "admin"){
            return res.status(401).json({success: false, message: "Unauthorized"});
        }
        next();
    }catch(err){
        return res.status(500).json({success: false, message: "Internal server error"});
    }
}

export { adminMiddleware };