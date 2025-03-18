import { Message } from "../db/Model.js";
import { notification } from "./NotifictionController.js";

const postMessage = async(req, res)=> {
    const {name, email,contact, message} = req.body;
    try{
        if(!name || !email || !contact || !message){
            return res.status(400).json({success: false, message: "Please fill all the fields"});
        }
        await Message.create({name, email,contact, message});
        await notification("newEnquiry", true, 'New Enquiry', `${name} has send a enquiry`)
        return res.status(200).json({success: true,message: "Message sent successfully",});
    }catch(err){
        return res.status(500).json({success: false, message: "Internal server error"});
    }
}

const getMessage = async(req, res)=> {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10; 
    try{
        const message = await Message.find().sort({ createdAt: -1 }).limit(limit).skip((page - 1) * limit);
        const totalMessage = await Message.countDocuments();
        const totalPages = Math.ceil(totalMessage / limit);

        if(page > totalPages){
            return res.status(404).json({success: false, message: "Page not found"});
        }
        if(!message){
            return res.status(404).json({success: false, message: "No message found"});
        }
        return res.status(200).json({success: true, data: message, totalPages, currentPage: page, totalMessage });
        
    }catch(err){
        return res.status(500).json({success: false, message: "Internal server error"});
    }
}

export {postMessage, getMessage};