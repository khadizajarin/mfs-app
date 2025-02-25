require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

app.use("/api", transactionRoutes);

//admin route
const adminRoutes = require("./routes/adminRoutes");

// const Transaction = require("./models/Transaction"); // Import the Transaction model
app.use("/api/admin", adminRoutes);

// Routes
app.use("/api/auth", authRoutes);

// Define the /api/transactions/send-money route
const User = require("./models/User"); // Import the User model
const Transaction = require("./models/Transaction"); // Import the Transaction model

// API to get user mobile number by email
app.get("/api/users/get-mobile", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ mobile: user.mobile });
  } catch (error) {
    console.error("Error fetching user mobile:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

app.post("/api/transactions/cash-out", async (req, res) => {
  const { userMobile, agentMobile, amount, pin } = req.body;

  // Validate input
  if (!userMobile || !agentMobile || !amount || !pin) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (amount < 100) {
    return res.status(400).json({ message: "Minimum cash-out amount is 100 Taka." });
  }

  try {
    // Find user and agent
    const user = await User.findOne({ mobile: userMobile });
    const agent = await User.findOne({ mobile: agentMobile, accountType: "agent" }); // Ensure agent role
    const admin = await User.findOne({ accountType: "admin" }); // Assuming there's a single admin

    if (!user) return res.status(404).json({ message: "User not found." });
    if (!agent) {
      console.log(`Agent with mobile ${agentMobile} not found or doesn't have the "agent" role`);
      return res.status(404).json({ message: "Agent not found or incorrect role." });
    }
    if (!admin) return res.status(500).json({ message: "Admin account not found." });

    // Verify user PIN
    const bcrypt = require("bcrypt");
    const isPinValid = await bcrypt.compare(pin, user.pin);
    if (!isPinValid) {
      return res.status(400).json({ message: "Incorrect PIN." });
    }

    // Calculate the fee (1.5% of the transaction amount)
    const fee = amount * 0.015;
    const agentIncome = amount * 0.01; // 1% to the agent
    const adminIncome = amount * 0.005; // 0.5% to the admin
    const totalDeduction = amount + fee; // Total deduction from user's balance

    // Check if user has enough balance
    if (user.balance < totalDeduction) {
      return res.status(400).json({ message: "Insufficient balance." });
    }

    // Update balances
    user.balance -= totalDeduction;
    agent.balance += amount + agentIncome;
    admin.balance += adminIncome;

    // Save updated balances
    await user.save();
    await agent.save();
    await admin.save();

    // Save transaction details
    const transaction = new Transaction({
      sender: user._id,
      recipient: agent._id,
      amount,
      fee,
      transactionType: "cash-out",
    });

    await transaction.save();

    res.status(200).json({
      message: `Cash-out successful! You withdrew ${amount} Taka.`,
      fee,
      transactionId: transaction._id,
    });

  } catch (error) {
    console.error("Error processing cash-out:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

app.post("/api/transactions/cash-in", async (req, res) => {
  const { userMobile, agentMobile, amount, pin } = req.body;

  // Validate input
  if (!userMobile || !agentMobile || !amount || !pin) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (amount < 50) {
    return res.status(400).json({ message: "Minimum cash-in amount is 50 Taka." });
  }

  try {
    // Find user and agent
    const user = await User.findOne({ mobile: userMobile });
    const agent = await User.findOne({ mobile: agentMobile, accountType: "agent" });

    if (!user) return res.status(404).json({ message: "User not found." });
    if (!agent) return res.status(404).json({ message: "Agent not found or incorrect role." });

    // Verify agent PIN
    const bcrypt = require("bcrypt");
    const isPinValid = await bcrypt.compare(pin, agent.pin);
    if (!isPinValid) {
      return res.status(400).json({ message: "Incorrect PIN." });
    }

    // Check if the agent has enough balance
    if (agent.balance < amount) {
      return res.status(400).json({ message: "Agent has insufficient balance." });
    }

    // Update balances
    user.balance += amount;
    agent.balance -= amount; // Deduct from agent

    // Save the updated balances
    await user.save();
    await agent.save();

    // Optionally, save transaction details
    const transaction = new Transaction({
      sender: agent._id,
      recipient: user._id,
      amount,
      transactionType: "cash-in",
    });

    await transaction.save();

    res.status(200).json({
      message: `Cash-in successful! ${amount} Taka added to user balance.`,
      transactionId: transaction.transactionId,
    });

  } catch (error) {
    console.error("Error processing cash-in:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// API to get agent details (mobile and PIN) by email
app.get("/api/users/get-agent", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if the user is an agent
    if (user.accountType !== "agent") {
      return res.status(400).json({ message: "User is not an agent." });
    }

    // Return the agent's details (mobile and PIN)
    res.status(200).json({
      mobile: user.mobile,
      pin: user.pin,  // Assuming PIN is stored securely (hashed)
    });

  } catch (error) {
    console.error("Error fetching agent details:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// app.get("/api/transactions", async (req, res) => {
//   try {
//     const transactions = await Transaction.find()
//       .select("_id sender recipient amount fee transactionType transactionId date");

//     res.status(200).json(transactions);
//   } catch (error) {
//     console.error("Error fetching transactions:", error);
//     res.status(500).json({ message: "Internal server error." });
//   }
// });


app.get('/api/transactions', async (req, res) => {
  try {
      const transactions = await Transaction.find()
          .populate('sender', 'mobile')   // Replace sender ID with sender's mobile
          .populate('receiver', 'mobile'); // Replace receiver ID with receiver's mobile

      res.json(transactions);
  } catch (error) {
      res.status(500).json({ message: 'Server Error' });
  }
});

app.get("/api/agents/approved", async (req, res) => {
  try {
    const agents = await User.find({ accountType: "agent", isApproved: true }).select("name mobile email");
    res.status(200).json(agents);
  } catch (error) {
    console.error("Error fetching approved agents:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

app.get('/api/users/approved', async (req, res) => {
  try {
      const approvedUsers = await User.find({ accountType: "user", isApproved: true });
      res.json(approvedUsers);
      console.log(approvedUsers)
  } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
  }
});


app.post("/api/transactions/send-money", async (req, res) => {
  const { senderMobile, recipientMobile, amount } = req.body;

  // Basic validation
  if (!senderMobile || !recipientMobile || !amount) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (amount < 50) {
    return res.status(400).json({ message: "Minimum amount is 50 Taka." });
  }

  try {
    // Find sender and recipient users in the database
    const sender = await User.findOne({ mobile: senderMobile });
    const recipient = await User.findOne({ mobile: recipientMobile });

    if (!sender) {
      return res.status(404).json({ message: "Sender not found." });
    }
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found." });
    }

    // Check if sender has enough balance
    if (sender.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance." });
    }

    // Transaction Fee (optional)
    const fee = Math.max(5, amount * 0.01); // Example: 1% fee, minimum 5 Taka

    // Update sender's and recipient's balance
    sender.balance -= amount + fee;
    recipient.balance += amount;

    // Save the updated users
    await sender.save();
    await recipient.save();

    // Save transaction details to the database
    const transaction = new Transaction({
      sender: sender._id,
      recipient: recipient._id,
      amount,
      fee,
      transactionType: "send",
    });

    await transaction.save();

    res.status(200).json({
      message: `Transaction successful! Transaction ID: ${transaction.transactionId}.`,
    });
  } catch (error) {
    console.error("Error processing transaction:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});



// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

// Sample Route
app.get("/", (req, res) => {
    res.json({ message: "Backend is running!" });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
