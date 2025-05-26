const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Otp = require('../models/Otp');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Save OTP in DB after deleting previous ones
async function saveOtp(email, otpCode) {
  await Otp.deleteMany({ email });
  const otp = new Otp({
    email,
    otpCode,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    used: false,
  });
  await otp.save();
}

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send OTP Email
async function sendOtpEmail(to, otp) {
  const mailOptions = {
    from: `"POztLite Verification" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your OTP Code',
html: `
  <div style="font-family: Arial, sans-serif; padding: 30px; background-color: #f9f9f9; color: #333;">
    <div style="max-width: 400px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); padding: 20px; text-align: center;">
      <h2 style="color: #1D4ED8; margin-bottom: 20px;">POztLite Verification</h2>
      <p style="font-size: 16px; margin-bottom: 10px;">Your One-Time Password (OTP) code is:</p>
      <div style="font-size: 36px; letter-spacing: 6px; font-weight: 700; color: #111; margin: 20px 0; user-select: all;">
        ${otp}
      </div>
      <p style="font-size: 14px; color: #555; margin-bottom: 0;">
        This code is valid for <strong>5 minutes</strong>. Please do not share it with anyone.
      </p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
      <p style="font-size: 12px; color: #999;">
        If you didn't request this code, please ignore this email or contact support.
      </p>
    </div>
  </div>
`,

  };
  await transporter.sendMail(mailOptions);
}

// Register user route (example)
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, phone, state_id, city_id } = req.body;
    if (await User.findOne({ email })) {
      return res.status(400).send({ message: 'Email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, phone, password: hashedPassword, state_id, city_id });
    await newUser.save();
    res.status(201).send({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Login and send OTP
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send({ message: 'Invalid password' });

    // Generate OTP and save/send
    const otp = generateOtp();
    await saveOtp(email, otp);
    await sendOtpEmail(email, otp);

    // Send JWT token (optional, you can send after OTP verification if you want)
    const token = jwt.sign({ id: user._id, name: user.name, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).send({ message: 'Login successful, OTP sent', token });
    console.log(`OTP for ${email}: ${otp}`); // For debugging only
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Verify OTP route
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otpCode } = req.body;
    if (!email || !otpCode) {
      return res.status(400).send({ message: 'Email and OTP code are required' });
    }

    const otpEntry = await Otp.findOne({ email, otpCode, used: false }).sort({ createdAt: -1 });
    if (!otpEntry) {
      return res.status(400).send({ message: 'Invalid OTP or already used' });
    }

    if (new Date() > otpEntry.expiresAt) {
      return res.status(400).send({ message: 'OTP has expired' });
    }

    otpEntry.used = true;
    await otpEntry.save();

    res.status(200).send({ message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Resend OTP route
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).send({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).send({ message: 'User not found' });

    const otp = generateOtp();
    await saveOtp(email, otp);
    await sendOtpEmail(email, otp);

    res.status(200).send({ message: 'OTP resent successfully' });
    console.log(`Resent OTP for ${email}: ${otp}`);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;
