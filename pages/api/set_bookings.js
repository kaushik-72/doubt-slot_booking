import clientPromise from "../../lib/mongodb";
import Bookings_table from "../../models/bookingModel";
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(400).json({ message: "Invalid HTTP POST method" });
    return;
  }
  try {
    const client = await clientPromise;
    const db = client.db("bookings");
    const {
      full_name,
      teacher,
      education,
      email,
      gender,
      teacher_ID,
      phoneNo,
      language,
      description,
      slot_date_time,
    } = req.body;

    const currentDateTime = new Date().toISOString();
    const result = await db.collection("bookings_table").insertOne({
      full_name,
      teacher,
      education,
      email,
      teacher_ID,
      gender,
      phoneNo,
      language,
      description,
      slot_date_time,
      booking_time: currentDateTime,
    });
    const myEmail = process.env.MY_EMAIL;
    const myPassword = process.env.MY_PASSWORD;
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: myEmail,
        pass: myPassword,
      },
    });
    let confirm = "";
    let email_data = `your booked ${teacher}`
    try {
      await transporter.sendMail({
        from: "DP",
        to: email,
        subject: `Booking confirmed with Mentor ${teacher}`,
        html: email_data,
      });
      // `<p>Your booking has been confirmed with our Mentor <h2>${teacher}</h2></p><br>
      //     <p><strong>Topics: </strong> ${description}</p><br>
      //     <p><strong>Slote Time: </strong> ${slot_date_time}</p><br>
      //   `
      confirm = "email sent";
    } catch (error) {
      confirm = "email not sent";
    }

    res.status(200).json({ message: `Booked Successfully! ${confirm}` });
  } catch (error) {
    res.status(500).json({ message: "Error While Booking!", error });
  }
}
