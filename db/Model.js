import mongoose from "mongoose";

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
    }
}, {
    timestamps: true
})

const User = mongoose.model('users', userSchema)

export {User}