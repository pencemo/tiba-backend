import { createTransport } from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const transporter = createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// var transporter = createTransport({
//   service: "gmail",
//     host: "smtp.gmail.com",
//     port: 587,
//     secure: false,
//   auth: {
//     user: 'mnmsby4@gamil.com',
//     pass: process.env.GMAIL_APP_PASSWORD,
//   },
// });

const sendMail = (mailOptions) => {
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

export { sendMail };
