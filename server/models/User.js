import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    // Kalvium Eligibility Metrics
    codingBelts: {
      java: { type: Number, default: 0, min: 0, max: 7 },
      cpp: { type: Number, default: 0, min: 0, max: 7 },
      python: { type: Number, default: 0, min: 0, max: 7 },
      javascript: { type: Number, default: 0, min: 0, max: 7 }
    },
    communicationScore: { type: Number, default: 0 }, // Cambridge test
    attendance: {
      quarterly: { type: Number, default: 0 },
      yearly: { type: Number, default: 0 }
    },
    vivaScore: { type: Number, default: 0 }
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

const User = mongoose.model('User', userSchema);
export default User;
