import mongoose, { Schema } from "mongoose";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    verificationCode: {
      type: String,
      default: "",
    },
    codeExpires: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: true,
    },
    role: {
      type: String,
      required: true,
      default: "user",
    },
    showroomId: {
      type: Schema.Types.ObjectId,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    profileImg: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const carSchema = mongoose.Schema(
  {
    make: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    category: {
      type: String,
    },
    year: {
      type: Number,
      required: true,
    },
    color: {
      type: String,
    }, 
    mileage: {
      type: Number,
    },
    transmission: {
      type: String,
      enum: ["manual", "automatic"],
      required: true,
    },
    fuel_type: {
      type: String,
      enum: ["petrol", "diesel", "electric", "hybrid"],
      required: true,
    },
    seats: {
      type: Number,
    },
    daily_rate: {
      type: Schema.Types.Decimal128,
      required: true,
    },
    weekly_rate: {
      type: Schema.Types.Decimal128,
      required: true,
    },
    monthly_rate: {
      type: Schema.Types.Decimal128,
      required: true,
    },
    available: {
      type: Boolean,
      default: true,
    },
    showroomId: {
      type: Schema.Types.ObjectId,
      ref: "showroom", // assuming Locations is a separate collection
      default: null,
    },
    admin_id: {
      type: Schema.Types.ObjectId,
      ref: "users", 
    },
    images: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const showroomSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    contactNo: {
      type: String,
      required: true,
    },
    locationLink: {
      type: String,
    },
    telphone: {
      type: String,
    },
    email: {
      type: String,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const notificationSchema = mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    isForAdmin: {
      type: Boolean,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    carId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "cars", 
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      required: true,
    },
    payment_id:{
      type: String,
      required: true,
    },
    order_id:{
        type: String,
        required: true,
    },
    
    //   pickup_location_id: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Location", // References the Locations collection
    //     required: true,
    //   },
    //   dropoff_location_id: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Location", // References the Locations collection
    //     required: true,
    //   },
    date: {
      type: { from: Date, to: Date },
      required: true,
    },
    showroomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "showroom",
      required: true,
    },
    totalCost: {
      type: mongoose.Decimal128,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", 'rejected'],
      default: "pending",
    },
  },
  {
    timestamps: true
  }
);

const messagesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  contact:{
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  }
},{
  timestamps: true
});


const User = mongoose.model("users", userSchema);
const Cars = mongoose.model("cars", carSchema);
const Showroom = mongoose.model("showroom", showroomSchema);
const Booking = mongoose.model("booking", bookingSchema);
const Notification = mongoose.model("notification", notificationSchema);
const Message = mongoose.model("message", messagesSchema);

export { User, Cars, Showroom, Notification, Booking, Message };
