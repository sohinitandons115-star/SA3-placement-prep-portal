import mongoose from 'mongoose';

const companySchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    appliedDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Applied', 'Online Assessment', 'Technical Interview', 'HR Interview', 'Selected', 'Rejected'],
      default: 'Applied',
    },
  },
  {
    timestamps: true,
  }
);

const Company = mongoose.model('Company', companySchema);
export default Company;
