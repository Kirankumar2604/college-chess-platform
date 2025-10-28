import User from "../models/User.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

const otpStore = new Map();

export const sendOTP = async (req, res) => {
  try {
    const { email, regNo } = req.body;

    // Accept both GCU and Gmail addresses
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(gcu\.edu\.in|gmail\.com)$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please use either your GCU email or Gmail address" });
    }

    // Warn about potential delivery issues for GCU emails
    if (email.endsWith('@gcu.edu.in')) {
      console.log('⚠️ Warning: Sending to GCU email address - delivery may be restricted by institutional policies');
    }

    let user = await User.findOne({ email });
    if (!user) user = await User.create({ regNo, email });

    const otp = crypto.randomInt(100000, 999999).toString();
    otpStore.set(email, otp);
    
    // Debug: Log OTP (remove in production)
    console.log('\n=================================================');
    console.log('🔑 OTP FOR TESTING:', otp);
    console.log('📧 Email:', email);
    console.log('=================================================\n');

    console.log('\n[OTP Debug] Generated OTP for', email, ':', otp, '\n');
    
    console.log('\n==================================================');
    console.log('🔑 OTP Generated:', otp);
    console.log('📧 Sending email to:', email);
    console.log('==================================================\n');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Verify SMTP connection first
    try {
      await transporter.verify();
      console.log('[Email] SMTP connection verified successfully');
    } catch (smtpError) {
      console.error('[Email] SMTP Verification failed:', smtpError);
      throw new Error('Failed to connect to email server: ' + smtpError.message);
    }

    await transporter.sendMail({
      from: '"College Chess Platform" <grootkiller340@gmail.com>',
      to: email,
      subject: "Chess Platform - Your OTP Verification Code",
      text: `Your OTP for Chess Platform verification is: ${otp}\n\nThis OTP will expire soon. Do not share it with anyone.`,
      html: `
        <h2>Chess Platform Verification</h2>
        <p>Your OTP is: <strong>${otp}</strong></p>
        <p>This OTP will expire soon. Do not share it with anyone.</p>
      `
    });

    res.json({ message: "OTP sent successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const validOtp = otpStore.get(email);

    if (!validOtp || otp !== validOtp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    otpStore.delete(email);

    const user = await User.findOneAndUpdate(
      { email },
      { verified: true },
      { new: true }
    );

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ message: "Verification successful", token });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
