import mongoose from 'mongoose';

const resourceSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['DSA', 'Aptitude', 'Resume', 'Interview Experience', 'Core Subjects'],
      default: 'DSA',
    },
    link: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Resource = mongoose.model('Resource', resourceSchema);
export default Resource;
