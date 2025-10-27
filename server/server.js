import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./src/models/User.js"

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("DB Error:", err));

app.get("/", (req, res) => {
  res.json({ status: "Backend OK" });
});

app.post("/api/users", async (req,res)=>{
    try {
    const { regNo, email } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ regNo });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create a new user
    const newUser = new User({
      regNo,
      email,
    });

    await newUser.save();  // Save the user to MongoDB
    res.status(201).json(newUser);  // Return the created user as the response
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server on ${PORT}`));
