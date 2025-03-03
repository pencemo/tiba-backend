import express, { json, urlencoded } from "express";
const app = express();
import path from "path";
import { dbConnection } from "./db/Connect.js";
import { router } from "./Routes/AuthRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import adminRouter from "./Routes/AdminRoutes.js";
import { carRoute } from "./Routes/CarDataRoutes.js";
import bookingRoute from "./Routes/bookingRoutes.js";
import notificationRoute from "./Routes/NotificationRoutes.js";
dotenv.config();
const __dirname = path.resolve();

app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    // origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
}))

app.use("/api/auth", router);
app.use("/api/admin", adminRouter)
app.use("/api/cars", carRoute)
app.use("/api/booking", bookingRoute)
app.use("/api/notification", notificationRoute)


app.get("/", (req, res) => {
  res.send("Hello World!");
});




const port = process.env.PORT || 3000;
app.listen(port, () => {
  dbConnection();
  console.log("Server running :",'\x1b[36m\x1b[4mhttp://localhost:3000\x1b[0m');
});

