import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  title: String,
  status: {
    type: String,
    enum: ['todo', 'doing', 'done'],
    required: true
  },
  priority: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

TaskSchema.index({ createdAt: -1, status: 1 });

export const Task = mongoose.model('Task', TaskSchema);
