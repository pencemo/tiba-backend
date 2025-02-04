import mongoose from "mongoose";

export const dbConnection = async () => {
    try{
        await mongoose.connect("mongodb://localhost:27017/myapp")
            .then(() => console.log("Connected to DB"))
            .catch((err) => console.log(err));
    }catch(err){
        console.log(err);
    }
}