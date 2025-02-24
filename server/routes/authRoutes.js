const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

// Register User
router.post("/register", async (req, res) => {
  try {
    const { name, pin, mobile, email, password, nid, accountType } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { mobile }, { nid }] });
    if (existingUser) {
      return res.status(400).json({ message: "Email, Mobile, or NID already in use" });
    }

    // Hash password and PIN
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedPin = await bcrypt.hash(pin, 10);

    // Assign balance based on account type
    let balance = accountType === "user" ? 40 : 100000;

    // Create new user
    const newUser = new User({
      name,
      pin: hashedPin,
      mobile,
      email,
      password: hashedPassword,
      nid,
      accountType,
      balance,
      isApproved: accountType === "user", // Users auto-approved, agents need approval
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully!", user: newUser });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
