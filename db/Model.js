import mongoose, { Schema } from "mongoose";

const userSchema = mongoose.Schema({
    name : {
        type: String,
        required: true,
    },
    email : {
        type: String,
        required: true,
        unique: true,
    },
    password : {
        type: String,
        required: true,
    },
    isAdmin : {
        type: Boolean,
        required: true,
        default: false,
    },
    verificationCode : {
        type: String,
        default: '',
    },
    codeExpires : {
        type: Date,
    },
    isVerified : {
        type: Boolean,
        required: true,
        default: false,
    },
    role : {
        type: String,
        required: true,
        default: 'user',
    },
    status : {
        type: String,
        default: 'active',
    },
    profileImg: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
})


const carSchema = mongoose.Schema({
    make: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    color: {
        type: String,
    },
    mileage: {
        type: Number,
    },
    transmission: {
        type: String,
        enum: ['manual', 'automatic'],
        required: true
    },
    fuel_type: {
        type: String,
        enum: ['petrol', 'diesel', 'electric', 'hybrid'],
        required: true
    },
    seats: {
        type: Number,
    },
    daily_rate: {
        type: Schema.Types.Decimal128,
        required: true
    },
    available: {
        type: Boolean,
        default: true
    },
    location_id: {
        type: Schema.Types.ObjectId,
        ref: 'Location', // assuming Locations is a separate collection
        default: null
    },
    admin_id: {
        type: Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    images: {
        type: [String],
        default: []
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

const User = mongoose.model('users', userSchema)
const Cars = mongoose.model('cars', carSchema)

export {User, Cars}