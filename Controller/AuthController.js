import { User } from "../db/Model.js";
import bcript from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendMail } from "../Util/SendMail.js";

// login controller
const login = async (req, res) => {
  if (!req.body.email || !req.body.password) {
    res
      .status(400)
      .json({ success: false, message: "Please provide all fields" });
    return;
  }
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const isMatch = await bcript.compare(req.body.password, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "10d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",//process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
    });
    res
      .status(200)
      .json({
        success: true,
        message: "User logged in successfully",
        data: user,
      });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error to find user" });
  }
};

// create user controller
const createUser = async (req, res) => {
  const { name, email, password } = req.body;

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
        .json({ success: false, message: "User already exists" });
    }

    const encryptedPassword = await bcript.hash(password, 10);
    if (!encryptedPassword) return res.status(400).json({ success: false, message: "Error to encript password" });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const codeExpires = Date.now() + 5 * 60 * 1000; // 10 minutes
    const newUser = new User({ name, email, password: encryptedPassword, verificationCode: otp, codeExpires });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "10d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none", // process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
    });


    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: newUser,
    });
    const mailOptions = {
      from: process.env.SEND_MAIL,
      to: email,
      subject: 'Welcome to our website',
      // text: `Welcome to our website ${name} your otp is ${otp}`,
      html: `<h4>Welcome to our website ${name}</h4><br><h3>Your otp is ${otp}</h3>`,    }
    sendMail(mailOptions)
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Error creating user" });
  }
};

// logout controller
const logOut = async (req, res) => {
  console.log(req.body.userId);
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none", // process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    res.status(200).json({ success: true, message: "User logged out" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error to log out" });
  }
};

// verify user controller
const verifyUser = async (req, res) => {
  const { userId, otp } = req.body;
  if (!otp) {
    return res.status(400).json({ success: false, message: "Please provide all fields" });
  }else if (!userId) {
    return res.status(400).json({ success: false, message: "User not authenticated" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if(user.isVerified){
      return res.status(400).json({ success: false, message: "User already verified" });
    }
    if(user.codeExpires < Date.now()){
      user.verificationCode = '';
      user.codeExpires = 0;
      await user.save();
      return res.status(400).json({ success: false, message: "OTP expired" });
    }
    if (user.verificationCode === otp && user.codeExpires > Date.now()) {
      user.isVerified = true;
      user.verificationCode = '';
      user.codeExpires = 0;
      await user.save();
      return res.status(200).json({ success: true, message: "User verified successfully" });
    }else{
      return res.status(400).json({ success: false, message: "Invalid otp" });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error to verify user" });
  }

}

// is Outh
const isOuth = async (req, res) => {
  if(!req.cookies.token){
    return res.status(401).json({ success: false, message: "User not authenticated" });
  }
  try {
    const user = await User.findById(req.body.userId);
    const {password, ...other} = user._doc;
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, message: "User authenticated" , data: other });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error to authenticate user" });
  }
}

export { login, createUser, logOut, verifyUser, isOuth};
