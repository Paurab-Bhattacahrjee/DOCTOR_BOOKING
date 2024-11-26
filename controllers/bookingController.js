const Booking = require('../models/Bookings');
const Doctor = require('../models/Doctor');
const User = require('../models/User'); // Import the User model
const nodemailer = require('nodemailer');
require('dotenv').config();

// Configure nodemailer
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS, // Your email password
    },
});

// Book an appointment
exports.bookAppointment = async (req, res) => {
    const { patientName, age, gender, city, branch, doctorId, date } = req.body;

    try {
        // Get user email from the User model using userId from req.user
        console.log(req.user.id);
        const user = await User.findById(req.user.id);
        if (!user) {
            console.log('User not found');
            return res.status(400).json({ message: 'User not found' });
        }
        const email = user.email; // Extract email from the User document

        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            console.log('Doctor not found');
            return res.status(400).json({ message: 'Doctor not found' });
        }

        if (doctor.appointmentsAvailable <= 0) {
            console.log('No booking slots available for doctor:', doctor.name);
            return res.status(400).json({ message: 'No booking slots available' });
        } else {
            console.log('Available appointments for doctor:', doctor.appointmentsAvailable);
        }

        // Create booking
        const booking = new Booking({
            patientName,
            age,
            gender,
            city,
            branch,
            doctor: doctor._id,
            date,
            email,
            userId: req.user.userId // Reference to the user
        });

        // Save booking
        await booking.save();

        // Update doctor's available appointments
        doctor.appointmentsAvailable -= 1;
        await doctor.save();

        // Send confirmation email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Appointment Confirmation',
            text: `Dear ${patientName},

Your booking has been confirmed.

Details:
Patient's Name: ${patientName}
Age: ${age}
Gender: ${gender}
City: ${city}
Branch: ${branch}
Doctor: ${doctor.name}
Date: ${date}

Thank you for choosing our service.

Best regards,
BookMyDoc`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending email:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });

        res.status(201).json({ message: 'Appointment booked successfully' });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
