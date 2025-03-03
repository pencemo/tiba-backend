import { Showroom } from "../db/Model.js";

const addShowroom = async(req, res)=> {
    const {name, address, city,state,country,contactNo,locationLink,telphone,email } = req.body;
    if(!name || !address || !city || !state || !country || !contactNo){
        return res.status(400).json({success: false, message: "Please provide all the required fields"});
    }
    try{
        const newShowroom = new Showroom({name, address, city,state,country,contactNo,locationLink,telphone,email });
        await newShowroom.save();

        return res.status(200).json({success: true, message: 'Showroom added successfully',});

    }catch(err){
        return res.status(500).json({success: false, message: "Internal server error"});
    }

}

const allShowroom = async(req, res)=> {
    try{
        const allShowroom = await Showroom.find();
        if(!allShowroom){
            return res.status(404).json({success: false, message: "No showroom found"});
        }
        return res.status(200).json({success: true, message: 'All Showroom', data: allShowroom});
    }catch(err){
        return res.status(500).json({success: false, message: "Internal server error"});
    }
}

export { addShowroom, allShowroom };