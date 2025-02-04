import express, { json, urlencoded } from "express";
const app = express();
import path from "path";
import { dbConnection } from "./db/Connect.js";
import { router } from "./Routes/AuthRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import { sendMail } from "./Util/SendMail.js";
dotenv.config();
const __dirname = path.resolve();

app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}))

app.use("/api/auth", router); //  Set up router for /api/auth

app.get("/", (req, res) => {
  console.log('app is redy');
  res.send("Hello World!");
});

// app.get("/login", (req, res) => {
//   res.sendFile(path.join(__dirname, "./index.html"));
// });

app.post("/mail", (req, res) => {
  const mail = req.body.mail;
  const otp = Math.floor(100000 + Math.random() * 900000);
  const mailOptions = {
    from: process.env.SEND_MAIL,
    to: mail,
    subject: 'Test mail',
    text: `Welcome to our website your otp is ${otp}`,
  }
  try{
    sendMail(mailOptions)
    res.status(201).json({
    success: true,
    message: "Mail sent successfully",
  });
  }catch(err){
    res.status(500).json({
      success: false,
      message: "Error to send mail",
    });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  dbConnection();  //  Create a new database connection
  console.log("Server running :",'\x1b[36m\x1b[4mhttp://localhost:3000\x1b[0m');
});

