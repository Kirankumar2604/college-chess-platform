import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  regNo: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  verified: { type: Boolean, default: false },
  rating: { type: Number, default: 800 }, // chess rating
  matchesPlayed: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model("User", UserSchema);
